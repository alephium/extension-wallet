import * as bip39 from 'bip39'

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
  ExplorerProvider
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
import { getNextPathIndex } from "./keys/keyDerivation"
import backupSchema from "./schema/backup.schema"
import { BrowserStorage, walletEncrypt, walletOpen } from './utils/walletStore'
import { AccountDiscovery } from '../shared/discovery'

const isDev = process.env.NODE_ENV === "development"

const CURRENT_BACKUP_VERSION = 1
export const SESSION_DURATION = isDev ? 24 * 60 : 30 // 30 mins in prod, 24 hours in dev

export const PROXY_CONTRACT_CLASS_HASHES = [
  "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
]
export const ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES = [
  "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
  "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
  "0x7e28fb0161d10d1cf7fe1f13e7ca57bce062731a3bd04494dfd2d0412699727",
]

const AlephiumStorage = new BrowserStorage()
const WalletName = 'alephium-extension-wallet'

export interface WalletSession {
  secret: string     // NOTE: mnemonic for ALPH
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

export class Wallet extends AccountDiscovery {
  constructor(
    private readonly store: IKeyValueStorage<WalletStorageProps>,
    private readonly walletStore: IArrayStorage<WalletAccount>,
    private readonly sessionStore: IObjectStorage<WalletSession | null>,
    private readonly getNetwork: GetNetwork,
  ) {
    super()
  }

  async signAndSubmitUnsignedTx(
    account: WalletAccount,
    params: SignUnsignedTxParams,
  ): Promise<SignUnsignedTxResult> {
    const signer = await this.getPrivateKeySigner(account)
    return signer.signAndSubmitUnsignedTx(params)
  }

  async submitSignedTx(account: WalletAccount, unsignedTx: string, signature: string): Promise<void> {
    const network = await this.getNetwork(account.networkId)
    const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)
    await nodeProvider.transactions.postTransactionsSubmit({ unsignedTx, signature })
    return
  }

  public async signMessage(
    account: WalletAccount,
    params: SignMessageParams
  ): Promise<SignMessageResult> {
    const signer = await this.getPrivateKeySigner(account)
    return signer.signMessage(params)
  }

  public async signUnsignedTx(
    account: WalletAccount,
    params: SignUnsignedTxParams
  ): Promise<SignUnsignedTxResult> {
    const signer = await this.getPrivateKeySigner(account)
    return await signer.signUnsignedTx(params)
  }

  public async getPrivateKeySigner(account: WalletAccount): Promise<PrivateKeyWallet> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session?.secret) {
      throw new Error("No seed")
    }

    const network = await this.getNetwork(account.networkId)
    const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)
    const privateKey = deriveHDWalletPrivateKey(session.secret, account.signer.keyType, account.signer.derivationIndex)
    return new PrivateKeyWallet({ privateKey, keyType: account.signer.keyType, nodeProvider })
  }

  public async isInitialized(): Promise<boolean> {
    try {
      await AlephiumStorage.load(WalletName)
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
      AlephiumStorage.save(WalletName, walletEncrypt(newPassword, seedPhrase))
      this.setSession(seedPhrase, newPassword)
      this.newAccountForRestoredWallet(seedPhrase)
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
      walletEncrypted = await AlephiumStorage.load(WalletName)
    } catch {
      walletEncrypted = undefined
    }

    try {
      if (!walletEncrypted) {
        const mnemonic = bip39.generateMnemonic(128)
        await AlephiumStorage.save(WalletName, walletEncrypt(password, mnemonic))
        this.setSession(mnemonic, password)
      } else {
        const mnemonic = walletOpen(password, walletEncrypted)
        this.setSession(mnemonic, password)
      }

      return true
    } catch (error) {
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
    return this.newAccountShared(session.secret, startIndex, networkId, keyType, forGroup)
  }

  public async newAccountForRestoredWallet(secret: string): Promise<WalletAccount> {
    return this.newAccountShared(secret, 0, defaultNetwork.id, 'default')
  }

  public async newAccountShared(secret: string, startIndex: number, networkId: string, keyType: KeyType, forGroup?: number): Promise<WalletAccount> {
    const account: WalletAccount = this.deriveAccount(secret, startIndex, networkId, keyType, forGroup)

    await this.walletStore.push([account])

    await this.selectAccount(account)

    return account
  }

  public async newAlephiumAccount(networkId: string, keyType: KeyType, group?: number): Promise<WalletAccount> {
    const session = await this.sessionStore.get()
    if (!this.isSessionOpen() || !session) {
      throw Error("no open session")
    }

    if (!session?.secret) {
      throw Error("no seed")
    } else {
      const newAndDefaultAddress = await this.newAccount(networkId, keyType, group)

      await this.store.set("selected", newAndDefaultAddress)

      return newAndDefaultAddress
    }
  }

  public async importLedgerAccount(walletAccount: WalletAccount): Promise<BaseWalletAccount> {
    await this.walletStore.push([walletAccount])
    await this.selectAccount(walletAccount)
    return walletAccount
  }

  public async getAllLedgerAccount(networkId: string): Promise<BaseWalletAccount[]> {
    const accounts = await this.walletStore.get(withHiddenSelector)

    return accounts.filter((account) =>
      account.type === "alephium" &&
      account.signer.type === "ledger" &&
      account.networkId === networkId
    )
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

  private sessionTimeoutListener = (alarm: browser.alarms.Alarm) => {
    if (alarm.name === "session_timeout") {
      return this.lock()
    }
  }

  private async setSession(secret: string, password: string) {
    await this.sessionStore.set({ secret, password })

    if (!browser.alarms.onAlarm.hasListener(this.sessionTimeoutListener)) {
      browser.alarms.onAlarm.addListener(this.sessionTimeoutListener)
    }

    await browser.alarms.clear("session_timeout")
    browser.alarms.create("session_timeout", {
      delayInMinutes: SESSION_DURATION,
    })
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

  public deriveAccount(secret: string, startIndex: number, networkId: string, keyType: KeyType, forGroup?: number): WalletAccount {
    const [privateKey, index] = forGroup === undefined ? [deriveHDWalletPrivateKey(secret, keyType, startIndex), startIndex]
      : deriveHDWalletPrivateKeyForGroup(secret, forGroup, keyType, startIndex)
    const publicKey = publicKeyFromPrivateKey(privateKey, keyType)
    const newAddress = addressFromPublicKey(publicKey, keyType)

    return {
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
  }

  public async discoverActiveAccounts(networkId: string): Promise<WalletAccount[]> {
    const accountsForNetwork = await this.walletStore.get(account => account.networkId == networkId)
    const selectedAccount = await this.getSelectedAccount()

    const session = await this.sessionStore.get()
    if (!(await this.isSessionOpen()) || !session) {
      throw Error("no open session")
    }

    const network = await this.getNetwork(networkId)
    if (!network.explorerUrl) {
      return []
    }

    console.info(`start discovering active accounts for ${networkId}`)
    const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
    const discoverAccount = (startIndex: number): Promise<WalletAccount> => {
      return Promise.resolve(this.deriveAccount(session.secret, startIndex, network.id, 'default'))
    }
    const walletAccounts = await this.deriveActiveAccountsForNetwork(explorerProvider, discoverAccount)
    const newDiscoveredAccounts = walletAccounts.filter(account => !accountsForNetwork.find(a => a.address === account.address))

    if (newDiscoveredAccounts.length > 0) {
      await this.walletStore.push(newDiscoveredAccounts)
      if (selectedAccount === undefined) {
        await this.selectAccount(newDiscoveredAccounts[0])
      }
    }
    console.info(`Discovered ${newDiscoveredAccounts.length} new active accounts for ${networkId}`)
    return newDiscoveredAccounts
  }
}
