import {
  ExplorerProvider,
  NodeProvider,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
  SignerProvider,
  addressFromPublicKey,
  publicKeyFromPrivateKey,
} from "@alephium/web3"
import {
  PrivateKeyWallet,
  deriveHDWalletPrivateKey,
} from "@alephium/web3-wallet"
import { ethers } from "ethers"
import { ProgressCallback } from "ethers/lib/utils"
import { find, noop, throttle, union } from "lodash-es"
import {
  Account,
  DeployAccountContractTransaction,
  EstimateFee,
  InvocationsDetails,
  ec,
  hash,
  number,
  stark,
} from "starknet"
import { Account as Accountv4 } from "starknet4"
import browser from "webextension-polyfill"

import { ArgentAccountType } from "./../shared/wallet.model"
import { getAccountTypesFromChain } from "../shared/account/details/fetchType"
import { withHiddenSelector } from "../shared/account/selectors"
import {
  Network,
  defaultNetwork,
  defaultNetworks,
  getProvider,
} from "../shared/network"
import { getProviderv4 } from "../shared/network/provider"
import {
  IArrayStorage,
  IKeyValueStorage,
  IObjectStorage,
  ObjectStorage,
} from "../shared/storage"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import { accountsEqual, baseDerivationPath } from "../shared/wallet.service"
import { isEqualAddress } from "../ui/services/addresses"
import { LoadContracts } from "./accounts"
import {
  declareContracts,
  getPreDeployedAccount,
} from "./devnet/declareAccounts"
import {
  getIndexForPath,
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "./keys/keyDerivation"
import backupSchema from "./schema/backup.schema"

const { calculateContractAddressFromHash, getSelectorFromName } = hash

const isDev = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isDevOrTest = isDev || isTest
const SCRYPT_N = isDevOrTest ? 64 : 262144 // 131072 is the default value used by ethers

const CURRENT_BACKUP_VERSION = 1
export const SESSION_DURATION = isDev ? 24 * 60 * 60 : 30 * 60 // 30 mins in prod, 24 hours in dev

const CHECK_OFFSET = 10

export const PROXY_CONTRACT_CLASS_HASHES = [
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
]
export const ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES = [
  "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
  "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
  "0x7e28fb0161d10d1cf7fe1f13e7ca57bce062731a3bd04494dfd2d0412699727",
]

export interface WalletSession {
  secret: string
  password: string
}

export interface WalletStorageProps {
  backup?: string
  selected?: BaseWalletAccount | null
  discoveredOnce?: boolean
}
/*
export const walletStore = new KeyValueStorage<WalletStorageProps>(
  {},
  "core:wallet",
) */

export const sessionStore = new ObjectStorage<WalletSession | null>(null, {
  namespace: "core:wallet:session",
  areaName: "session",
})

export type GetNetwork = (networkId: string) => Promise<Network>

export class Wallet {
  constructor(
    private readonly store: IKeyValueStorage<WalletStorageProps>,
    private readonly walletStore: IArrayStorage<WalletAccount>,
    private readonly sessionStore: IObjectStorage<WalletSession | null>,
    private readonly loadContracts: LoadContracts,
    private readonly getNetwork: GetNetwork,
  ) {}
  async signAndSubmitUnsignedTx(
    account: WalletAccount,
    params: SignUnsignedTxParams,
  ): Promise<SignUnsignedTxResult> {
    const signer = await this.getPrivateKeySigner(account)
    return signer.signAndSubmitUnsignedTx(params)
  }

  async getPrivateKeySigner(account: WalletAccount): Promise<PrivateKeyWallet> {
    const network = await this.getNetwork(account.networkId)
    const nodeProvider = new NodeProvider(network.nodeUrl)
    const privateKey = await this.getPrivateKeyByDerivationPath(
      account.signer.derivationIndex,
    )
    return new PrivateKeyWallet(privateKey, nodeProvider)
  }

  public async isInitialized(): Promise<boolean> {
    return Boolean(await this.store.get("backup"))
  }

  public async isSessionOpen(): Promise<boolean> {
    return (await this.sessionStore.get()) !== null
  }

  private async generateNewLocalSecret(
    password: string,
    progressCallback?: ProgressCallback,
  ) {
    if (await this.isInitialized()) {
      return
    }

    const ethersWallet = ethers.Wallet.createRandom()
    const encryptedBackup = await ethersWallet.encrypt(
      password,
      { scrypt: { N: SCRYPT_N } },
      progressCallback,
    )

    await this.store.set("discoveredOnce", true)
    await this.store.set("backup", encryptedBackup)
    return this.setSession(ethersWallet.privateKey, password)
  }

  public async getSeedPhrase(): Promise<string> {
    const session = await this.sessionStore.get()
    const backup = await this.store.get("backup")

    if (!(await this.isSessionOpen()) || !session || !backup) {
      throw new Error("Session is not open")
    }

    const wallet = await ethers.Wallet.fromEncryptedJson(
      backup,
      session.password,
    )

    return wallet.mnemonic.phrase
  }

  public async restoreSeedPhrase(seedPhrase: string, newPassword: string) {
    const session = await this.sessionStore.get()
    if ((await this.isInitialized()) || session) {
      throw new Error("Wallet is already initialized")
    }
    const ethersWallet = ethers.Wallet.fromMnemonic(seedPhrase)
    const encryptedBackup = await ethersWallet.encrypt(newPassword, {
      scrypt: { N: SCRYPT_N },
    })

    await this.importBackup(encryptedBackup)
    await this.setSession(ethersWallet.privateKey, newPassword)

    await this.discoverAccounts()
  }

  public async discoverAccounts() {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw new Error("Wallet is not initialized")
    }
    const wallet = new ethers.Wallet(session?.secret)

    const networks = defaultNetworks
      .map((network) => network.id)
      .filter((networkId) => networkId !== "localhost")
    const accountsResults = await Promise.all(
      networks.map(async (networkId) => {
        const network = await this.getNetwork(networkId)
        if (!network) {
          throw new Error(`Network ${networkId} not found`)
        }
        return this.restoreAccountsFromWallet(wallet.privateKey, network)
      }),
    )
    const accounts = accountsResults.flatMap((x) => x)

    await this.walletStore.push(accounts)

    this.store.set("discoveredOnce", true)
  }

  private async getAccountClassHashForNetwork(
    network: Network,
    accountType: ArgentAccountType,
  ): Promise<string> {
    if (network.accountClassHash) {
      if (
        accountType === "argent-plugin" &&
        network.accountClassHash.argentPluginAccount
      ) {
        return network.accountClassHash.argentPluginAccount
      }
      return network.accountClassHash.argentAccount
    }

    const deployerAccount = await getPreDeployedAccount(network)
    if (deployerAccount) {
      const { account } = await declareContracts(
        network,
        deployerAccount,
        this.loadContracts,
      )

      return account.class_hash
    }

    return ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES[0]
  }

  private async restoreAccountsFromWallet(
    secret: string,
    network: Network,
    offset: number = CHECK_OFFSET,
  ): Promise<WalletAccount[]> {
    const provider = getProvider(network)

    const accounts: WalletAccount[] = []

    const accountClassHashes = union(
      ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES,
      network?.accountClassHash?.argentAccount
        ? [network.accountClassHash.argentAccount]
        : [],
    )
    const proxyClassHashes = PROXY_CONTRACT_CLASS_HASHES

    if (!accountClassHashes?.length) {
      console.error(`No known account class hashes for network ${network.id}`)
      return accounts
    }

    const proxyClassHashAndAccountClassHash2DMap = proxyClassHashes.flatMap(
      (contractHash) =>
        accountClassHashes.map(
          (implementation) => [contractHash, implementation] as const,
        ),
    )

    const promises = proxyClassHashAndAccountClassHash2DMap.map(
      async ([contractClassHash, accountClassHash]) => {
        let lastHit = 0
        let lastCheck = 0

        while (lastHit + offset > lastCheck) {
          const starkPair = getStarkPair(lastCheck, secret, baseDerivationPath)
          const starkPub = ec.getStarkKey(starkPair)

          const address = calculateContractAddressFromHash(
            starkPub,
            contractClassHash,
            stark.compileCalldata({
              implementation: accountClassHash,
              selector: getSelectorFromName("initialize"),
              calldata: stark.compileCalldata({
                signer: starkPub,
                guardian: "0",
              }),
            }),
            0,
          )

          const code = await provider.getCode(address)

          if (code.bytecode.length > 0) {
            lastHit = lastCheck
            accounts.push({
              address,
              networkId: network.id,
              signer: {
                type: "local_secret",
                derivationIndex: lastCheck,
              },
              type: "argent",
            })
          }

          ++lastCheck
        }
      },
    )

    await Promise.all(promises)

    try {
      const accountWithTypes = await getAccountTypesFromChain(accounts)
      return accountWithTypes
    } catch (error) {
      console.error("Error getting account types from chain", error)
      return accounts
    }
  }

  public async startSession(
    password: string,
    progressCallback?: ProgressCallback,
  ): Promise<boolean> {
    // session has already started
    const session = await this.sessionStore.get()
    if (session) {
      return true
    }

    const throttledProgressCallback = throttle(progressCallback ?? noop, 50, {
      leading: true,
      trailing: true,
    })

    // wallet is not initialized: let's initialise it
    if (!(await this.isInitialized())) {
      await this.generateNewLocalSecret(password, throttledProgressCallback)
      return true
    }

    const backup = await this.store.get("backup")

    if (!backup) {
      throw new Error("Backup is not found")
    }

    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(
        backup,
        password,
        throttledProgressCallback,
      )

      await this.setSession(wallet.privateKey, password)

      // if we have not yet discovered accounts, do it now. This only applies to wallets which got restored from a backup file, as we could not restore all accounts from onchain yet as the backup was locked until now.
      const discoveredOnce = await this.store.get("discoveredOnce")
      if (!discoveredOnce) {
        await this.discoverAccounts()
      }

      return true
    } catch {
      return false
    }
  }

  public async checkPassword(password: string): Promise<boolean> {
    const session = await this.sessionStore.get()
    return session?.password === password
  }

  public async discoverAccountsForNetwork(
    network?: Network,
    offset: number = CHECK_OFFSET,
  ) {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session?.secret) {
      throw new Error("Session is not open")
    }
    const wallet = new ethers.Wallet(session?.secret)

    if (!network) {
      return
    }

    const accounts = await this.restoreAccountsFromWallet(
      wallet.privateKey,
      network,
      offset,
    )

    await this.walletStore.push(accounts)
  }

  public async newAccount(networkId: string): Promise<WalletAccount> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session) {
      throw Error("no open session")
    }

    const accounts = await this.walletStore.get(withHiddenSelector)

    const currentIndexes = accounts
      .filter((account) => account.signer.type === "local_secret")
      .map((account) => account.signer.derivationIndex)

    const index = getNextPathIndex(currentIndexes)

    const privateKey = deriveHDWalletPrivateKey(session.secret, index)
    const publicKey = publicKeyFromPrivateKey(privateKey)
    const newAddress = addressFromPublicKey(publicKey)

    const account: WalletAccount = {
      address: newAddress,
      networkId: networkId,
      signer: {
        type: "local_secret" as const,
        publicKey: publicKey,
        derivationIndex: index,
      },
      type: "argent",
    }

    await this.walletStore.push([account])

    await this.selectAccount(account)

    return account
  }

  public async getAccount(selector: BaseWalletAccount): Promise<WalletAccount> {
    const [hit] = await this.walletStore.get((account) =>
      accountsEqual(account, selector),
    )
    if (!hit) {
      throw Error("account not found")
    }
    return hit
  }

  public async getPrivateKeyByDerivationPath(derivationIndex: number) {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw Error("session is not open")
    }
    return deriveHDWalletPrivateKey(session.secret, derivationIndex)
  }

  public async getPublicKeyByDerivationPath(derivationIndex: number) {
    const privateKey = await this.getPrivateKeyByDerivationPath(derivationIndex)
    return publicKeyFromPrivateKey(privateKey)
  }

  public async getKeyPairByDerivationPath(derivationPath: string) {
    const session = await this.sessionStore.get()
    if (!session?.secret) {
      throw Error("session is not open")
    }
    return getStarkPair(derivationPath, session.secret)
  }

  public async isNonceManagedOnAccountContract(account: Accountv4) {
    try {
      // This will fetch nonce from account contract instead of Starknet OS
      await account.getNonce()
      return true
    } catch {
      return false
    }
  }

  public async getSelectedAccount(): Promise<WalletAccount | undefined> {
    if (!this.isSessionOpen()) {
      return
    }
    const accounts = await this.walletStore.get()
    const selectedAccount = await this.store.get("selected")
    const defaultAccount =
      accounts.find((account) => account.networkId === defaultNetwork.id) ??
      accounts[0]
    if (!selectedAccount) {
      return defaultAccount
    }
    const account = find(accounts, (account) =>
      accountsEqual(selectedAccount, account),
    )
    return account ?? defaultAccount
  }

  public async selectAccount(accountIdentifier?: BaseWalletAccount) {
    if (!accountIdentifier) {
      await this.store.set("selected", null) // Set null instead of undefinded
      return
    }

    const accounts = await this.walletStore.get()
    const account = find(accounts, (account) =>
      accountsEqual(account, accountIdentifier),
    )

    if (!account) {
      throw Error("account not found")
    }

    const { address, networkId } = account // makes sure to strip away unused properties
    await this.store.set("selected", { address, networkId })
    return account
  }

  public async lock() {
    await this.sessionStore.set(this.sessionStore.defaults)
  }

  public async exportBackup(): Promise<{ url: string; filename: string }> {
    const backup = await this.store.get("backup")

    if (!backup) {
      throw Error("no local backup")
    }
    const blob = new Blob([backup], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const filename = "argent-x-backup.json"
    return { url, filename }
  }

  public async exportPrivateKey(): Promise<string> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session?.secret) {
      throw new Error("Session is not open")
    }

    const account = await this.getSelectedAccount()
    if (!account) {
      throw new Error("no selected account")
    }

    const privateKey = deriveHDWalletPrivateKey(
      session.secret,
      account.signer.derivationIndex,
    )
    return privateKey
  }

  public static validateBackup(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString)
      return backupSchema.isValidSync(backup)
    } catch {
      return false
    }
  }

  private async setSession(secret: string, password: string) {
    await this.sessionStore.set({ secret, password })

    browser.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === "session_timeout") {
        return this.lock()
      }
    })

    const alarm = await browser.alarms.get("session_timeout")
    if (alarm?.name !== "session_timeout") {
      browser.alarms.create("session_timeout", {
        delayInMinutes: SESSION_DURATION,
      })
    }
  }

  public async importBackup(backup: string): Promise<void> {
    if (!Wallet.validateBackup(backup)) {
      throw new Error("invalid backup file in local storage")
    }

    const backupJson = JSON.parse(backup)
    if (backupJson.argent?.version !== CURRENT_BACKUP_VERSION) {
      // in the future, backup file migration will happen here
    }

    await this.store.set("backup", backup)

    const accounts: WalletAccount[] = await Promise.all(
      (backupJson.argent?.accounts ?? []).map(async (account: any) => {
        const network = await this.getNetwork(account.network)
        return {
          ...account,
          network,
          networkId: network.id,
        }
      }),
    )

    if (accounts.length > 0) {
      await this.walletStore.push(accounts)
    }
  }
}
