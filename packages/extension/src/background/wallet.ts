import {
  AddressAndKeys,
  deriveNewAddressData,
  getStorage,
  walletGenerate,
  walletOpen,
} from "@alephium/sdk"
import { Balance } from "@alephium/sdk/api/alephium"
import { Transaction } from "@alephium/sdk/api/explorer"
import { ExplorerProvider, NodeProvider } from "@alephium/web3"
import { PrivateKeyWallet } from "@alephium/web3/test"
import { find } from "lodash-es"

import { Network } from "../shared/networks"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import type { IStorage } from "./storage"

const AlephiumStorage = getStorage()

export const SESSION_DURATION = 15 * 60 * 60 * 1000 // 15 hours

interface WalletSession {
  secret: string // private key
  password: string
  seed: Buffer
  mnemonic: string
}

export interface WalletStorageProps {
  backup?: string
  selected?: BaseWalletAccount
  accounts?: WalletAccount[]
  selectedAddress?: AddressAndKeys
  addresses?: AddressAndKeys[]
  discoveredOnce?: boolean
}

export type GetCurrentNetwork = () => Promise<Network>

export class Wallet {
  private session?: WalletSession

  constructor(
    private readonly store: IStorage<WalletStorageProps>,
    private readonly getCurrentNetwork: GetCurrentNetwork,
    private readonly onAutoLock?: () => Promise<void>,
  ) {}

  async getNodeProvider(): Promise<NodeProvider> {
    const currentNetwork = await this.getCurrentNetwork()
    return new NodeProvider(currentNetwork.nodeUrl)
  }

  async getExplorerProvider(): Promise<ExplorerProvider> {
    const currentNetwork = await this.getCurrentNetwork()
    return new ExplorerProvider(currentNetwork.explorerApiUrl)
  }

  public isInitialized(): boolean {
    return this.isSessionOpen()
  }

  public isSessionOpen(): boolean {
    return this.session !== undefined
  }

  public async getAlephiumPrivateKeySigner(): Promise<
    PrivateKeyWallet | undefined
  > {
    const addressAndKeys = await this.getAlephiumSelectedAddresses()
    const nodeProvider = await this.getNodeProvider()
    let result = undefined
    if (addressAndKeys) {
      result = new PrivateKeyWallet(nodeProvider, addressAndKeys.privateKey)
    }
    return result
  }

  public async getAlephiumAddresses(): Promise<AddressAndKeys[]> {
    // Only one for now
    const addresses = await this.store.getItem("addresses")
    if (addresses) {
      return addresses
    } else {
      return []
    }
  }

  private resetAccounts() {
    return this.store.setItem("accounts", [])
  }

  public async getSeedPhrase(): Promise<string> {
    if (!this.session) {
      throw new Error("Session is not open")
    }
    return this.session.mnemonic
  }

  public async startAlephiumSession(
    walletName: string,
    password: string,
  ): Promise<boolean> {
    if (this.session) {
      return true
    }

    let walletEncrypted
    try {
      walletEncrypted = AlephiumStorage.load(walletName)
    } catch {
      walletEncrypted = undefined
    }

    try {
      if (!walletEncrypted) {
        const wallet = walletGenerate()
        AlephiumStorage.save(walletName, wallet.encrypt(password))
        this.setSession(
          wallet.privateKey,
          password,
          wallet.seed,
          wallet.mnemonic,
        )
      } else {
        const wallet = walletOpen(password, walletEncrypted)
        this.setSession(
          wallet.privateKey,
          password,
          wallet.seed,
          wallet.mnemonic,
        )
      }

      return true
    } catch {
      return false
    }
  }

  public checkPassword(password: string): boolean {
    return this.session?.password === password
  }

  public async getBalance(address: string): Promise<Balance> {
    const nodeProvider = await this.getNodeProvider()
    return nodeProvider.addresses.getAddressesAddressBalance(address)
  }

  public async selectAlephiumAddress(address: string) {
    const addresses = await this.getAlephiumAddresses()

    const selectedAddress = find(addresses, (addr) => addr.address === address)

    if (selectedAddress) {
      await this.store.setItem("selectedAddress", selectedAddress)
    }
  }

  public async addAlephiumAddress(): Promise<AddressAndKeys | undefined> {
    if (!this.session?.seed) {
      return undefined
    } else {
      // do not store at the moment, but use public key and private key to sign
      // store later
      const addresses = await this.store.getItem("addresses")
      let newAddress
      if (addresses) {
        const skipIndexes = addresses.map((address) => address.addressIndex)
        newAddress = deriveNewAddressData(
          this.session.seed,
          undefined,
          undefined,
          skipIndexes,
        )
        await this.store.setItem("addresses", [...addresses, newAddress])
      } else {
        newAddress = deriveNewAddressData(this.session.seed, undefined, 0)
        await this.store.setItem("addresses", [newAddress])
      }

      await this.store.setItem("selectedAddress", newAddress)

      return newAddress
    }
  }

  // get accounts for Alephium, but lets just have one account
  public async getAlephiumSelectedAddresses(): Promise<
    AddressAndKeys | undefined
  > {
    if (!this.session?.seed) {
      return undefined
    } else {
      return await this.store.getItem("selectedAddress")
    }
  }

  public lock() {
    this.session = undefined
  }

  public async reset() {
    await this.resetAccounts()
    this.session = undefined
  }

  // Get all transactions, maybe doesn't belong here
  public async getTransactions(address: string): Promise<Transaction[]> {
    const explorerProvider = await this.getExplorerProvider()
    return await explorerProvider.addresses.getAddressesAddressTransactions(
      address,
    )
  }

  private setSession(
    secret: string,
    password: string,
    seed: Buffer,
    mnemonic: string,
  ) {
    this.session = { secret, password, seed, mnemonic }

    setTimeout(() => {
      this.lock()
      this.onAutoLock?.()
    }, SESSION_DURATION)
  }
}
