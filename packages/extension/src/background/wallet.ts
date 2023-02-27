import {
  getStorage,
  walletGenerate,
  walletImport,
  walletOpen
} from '@alephium/sdk'

import {
  NodeProvider,
  SignMessageParams,
  SignMessageResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
  addressFromPublicKey,
  publicKeyFromPrivateKey,
  groupOfAddress,
  KeyType,
} from "@alephium/web3"
import {
  PrivateKeyWallet,
  deriveHDWalletPrivateKey,
  deriveHDWalletPrivateKeyForGroup
} from "@alephium/web3-wallet"
import { find } from "lodash-es"
import browser from "webextension-polyfill"

import { withHiddenSelector } from "../shared/account/selectors"
import {
  Network,
  defaultNetwork,
} from "../shared/network"
import {
  IArrayStorage,
  IKeyValueStorage,
  IObjectStorage,
  ObjectStorage,
} from "../shared/storage"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import { accountsEqual } from "../shared/wallet.service"
import {
  getNextPathIndex,
} from "./keys/keyDerivation"
import backupSchema from "./schema/backup.schema"

const isDev = process.env.NODE_ENV === "development"

const CURRENT_BACKUP_VERSION = 1
export const SESSION_DURATION = isDev ? 24 * 60 * 60 : 30 * 60 // 30 mins in prod, 24 hours in dev

export const PROXY_CONTRACT_CLASS_HASHES = [
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
]
export const ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES = [
  "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
  "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
  "0x7e28fb0161d10d1cf7fe1f13e7ca57bce062731a3bd04494dfd2d0412699727",
]

const AlephiumStorage = getStorage()
const WalletName = 'alephium-extension-wallet'

export interface WalletSession {
  secret: string     // NOTE: mnemonic for ALPH
  seed?: Buffer
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
    private readonly getNetwork: GetNetwork,
  ) { }
  async signAndSubmitUnsignedTx(
    account: WalletAccount,
    params: SignUnsignedTxParams,
  ): Promise<SignUnsignedTxResult> {
    const signer = await this.getPrivateKeySigner(account)
    return signer.signAndSubmitUnsignedTx(params)
  }

  public async signMessage(
    account: WalletAccount,
    params: SignMessageParams
  ): Promise<SignMessageResult> {
    const signer = await this.getPrivateKeySigner(account)
    return signer.signMessage(params)
  }

  public async getPrivateKeySigner(account: WalletAccount): Promise<PrivateKeyWallet> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session?.seed) {
      throw new Error("No seed")
    }

    const network = await this.getNetwork(account.networkId)
    const nodeProvider = new NodeProvider(network.nodeUrl)
    const privateKey = deriveHDWalletPrivateKey(session.secret, account.signer.keyType, account.signer.derivationIndex)
    return new PrivateKeyWallet({ privateKey, keyType: account.signer.keyType, nodeProvider })
  }

  public async isInitialized(): Promise<boolean> {
    try {
      AlephiumStorage.load(WalletName)
    } catch {
      return false
    }

    return true
  }

  public async isSessionOpen(): Promise<boolean> {
    return (await this.sessionStore.get()) !== null
  }

  public async getSeedPhrase(): Promise<string> {
    const session = await this.sessionStore.get()

    if (!(await this.isSessionOpen()) || !session) {
      throw new Error("Session is not open")
    }

    return session.secret
  }

  public async restoreSeedPhrase(seedPhrase: string, newPassword: string) {
    const session = await this.sessionStore.get()
    if ((await this.isInitialized()) || session) {
      throw new Error("Wallet is already initialized")
    }

    try {
      const wallet = walletImport(seedPhrase)
      AlephiumStorage.save(WalletName, wallet.encrypt(newPassword))
      this.setSession(wallet.mnemonic, newPassword, wallet.seed)
    } catch {
      throw Error('Restore seedphrase failed')
    }
  }

  public async startAlephiumSession(password: string): Promise<boolean> {
    const session = await this.sessionStore.get()
    if (session) {
      return true
    }

    let walletEncrypted
    try {
      walletEncrypted = AlephiumStorage.load(WalletName)
    } catch {
      walletEncrypted = undefined
    }

    try {
      if (!walletEncrypted) {
        const wallet = walletGenerate()
        AlephiumStorage.save(WalletName, wallet.encrypt(password))
        this.setSession(wallet.mnemonic, password, wallet.seed)
      } else {
        const wallet = walletOpen(password, walletEncrypted)
        this.setSession(wallet.mnemonic, password, wallet.seed)
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

  static checkAccount(account: WalletAccount, networkId?: string, keyType?: KeyType, group?: number): boolean {
    return (networkId === undefined || account.networkId === networkId) &&
      (keyType === undefined || account.signer.keyType === keyType) &&
      (group === undefined || account.signer.group === group)
  }

  public async newAccount(networkId: string, keyType: KeyType, forGroup?: number): Promise<WalletAccount> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session) {
      throw Error("no open session")
    }

    const accounts = await this.walletStore.get(withHiddenSelector)

    const currentIndexes = accounts
      .filter((account) => account.signer.type === "local_secret" && Wallet.checkAccount(account, networkId, keyType, forGroup))
      .map((account) => account.signer.derivationIndex)

    const startIndex = getNextPathIndex(currentIndexes)
    const [privateKey, index] = forGroup === undefined ? [deriveHDWalletPrivateKey(session.secret, keyType, startIndex), startIndex]
      : deriveHDWalletPrivateKeyForGroup(session.secret, forGroup, keyType, startIndex)
    const publicKey = publicKeyFromPrivateKey(privateKey, keyType)
    const newAddress = addressFromPublicKey(publicKey, keyType)

    const account: WalletAccount = {
      address: newAddress,
      networkId: networkId,
      signer: {
        type: "local_secret" as const,
        publicKey: publicKey,
        keyType: keyType,
        derivationIndex: index,
        group: groupOfAddress(newAddress)
      },
      type: "alephium",
    }

    await this.walletStore.push([account])

    await this.selectAccount(account)

    return account
  }

  public async newAlephiumAccount(networkId: string, keyType: KeyType, group?: number): Promise<WalletAccount> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session) {
      throw Error("no open session")
    }

    if (!session?.seed) {
      throw Error("no seed")
    } else {
      const newAndDefaultAddress = await this.newAccount(networkId, keyType, group)

      await this.store.set("selected", newAndDefaultAddress)

      return newAndDefaultAddress
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

  matchGroup(address: string, group?: number): boolean {
    return group === undefined || groupOfAddress(address) === group
  }

  public async getAlephiumSelectedAddress(networkId?: string, group?: number, keyType?: KeyType): Promise<WalletAccount | undefined> {
    const accounts = await this.walletStore.get()
    const selectedAccount = await this.store.get("selected")
    const selectedWallet = !selectedAccount ? undefined : find(accounts, (account) => accountsEqual(selectedAccount, account))

    if (selectedWallet && Wallet.checkAccount(selectedWallet, networkId, keyType, group)) {
      return selectedWallet
    } else {
      const result = accounts.find((account) => Wallet.checkAccount(account, networkId, keyType, group))
      if (result) {
        await this.store.set("selected", result)
      }

      return result
    }
  }

  public async selectAccount({ address, networkId }: BaseWalletAccount) {
    const account = await this.getAccount({ address, networkId })
    await this.store.set("selected", { address: account.address, networkId: account.networkId })
    return account
  }

  public async getAccount({ address, networkId }: { address: string, networkId?: string }) {
    const accounts = await this.walletStore.get()
    const account = find(accounts, (account) =>
      account.address === address && (networkId === undefined || account.networkId === networkId)
    )

    if (!account) {
      throw Error("account not found")
    }

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
      account.signer.keyType,
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

  private async setSession(secret: string, password: string, seed?: Buffer) {
    await this.sessionStore.set({ secret, seed, password })

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
