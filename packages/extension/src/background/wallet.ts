import {
  TOTAL_NUMBER_OF_GROUPS,
  deriveNewAddressData,
  getStorage,
  walletGenerate,
  walletImport,
  walletOpen
} from '@alephium/sdk'
import { AddressBalance } from '@alephium/sdk/api/explorer'
import { ExplorerProvider, NodeProvider, web3, groupOfAddress } from '@alephium/web3'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { find, range } from 'lodash-es'
import { AddressAndPublicKey } from '../shared/addresses'

import { Network } from '../shared/networks'
import type { IStorage } from './storage'

const AlephiumStorage = getStorage()

export const SESSION_DURATION = 15 * 60 * 60 * 1000 // 15 hours

const WalletName = 'alephium-extension-wallet'

interface WalletSession {
  password: string
  seed: Buffer
  mnemonic: string
}

export interface WalletStorageProps {
  defaultAddress?: AddressAndPublicKey
  addresses?: AddressAndPublicKey[]
  discoveredOnce?: boolean
}

export type GetCurrentNetwork = () => Promise<Network>

export class Wallet {
  private session?: WalletSession

  constructor(
    private readonly store: IStorage<WalletStorageProps>,
    private readonly getCurrentNetwork: GetCurrentNetwork,
    private readonly onAutoLock?: () => Promise<void>
  ) {}

  async getNodeProvider(): Promise<NodeProvider> {
    web3.setCurrentNodeProvider((await this.getCurrentNetwork()).nodeUrl)
    return web3.getCurrentNodeProvider()
  }

  async getExplorerProvider(): Promise<ExplorerProvider> {
    const currentNetwork = await this.getCurrentNetwork()
    return new ExplorerProvider(currentNetwork.explorerApiUrl)
  }

  public isInitialized(): boolean {
    try {
      AlephiumStorage.load(WalletName)
    } catch {
      return false
    }

    return true
  }

  public isSessionOpen(): boolean {
    return !!this.session
  }

  public async getAlephiumPrivateKeySigner(): Promise<PrivateKeyWallet | undefined> {
    const addressAndPublicKey = await this.getAlephiumDefaultAddress()
    const nodeProvider = await this.getNodeProvider()

    let result = undefined
    if (addressAndPublicKey && !!this.session) {
      const group = groupOfAddress(addressAndPublicKey.address)
      const addressAndKeys = deriveNewAddressData(this.session.seed, group, addressAndPublicKey.addressIndex)
      result = new PrivateKeyWallet(addressAndKeys.privateKey, nodeProvider)
    }
    return result
  }

  public async getAlephiumAddresses(): Promise<AddressAndPublicKey[]> {
    // Only one for now
    const addresses = await this.store.getItem('addresses')
    if (addresses) {
      return addresses
    } else {
      return []
    }
  }

  private resetAddresses() {
    return this.store.setItem('addresses', [])
  }

  public async getSeedPhrase(): Promise<string> {
    if (!this.session) {
      throw new Error('Session is not open')
    }
    return this.session.mnemonic
  }

  public async restoreSeedPhrase(seedPhrase: string, password: string) {
    if (this.isInitialized() || this.session) {
      throw new Error('Wallet is already initialized')
    }

    try {
      const wallet = walletImport(seedPhrase)
      AlephiumStorage.save(WalletName, wallet.encrypt(password))
      this.setSession(password, wallet.seed, wallet.mnemonic)
    } catch {
      throw Error('Restore seedphrase failed')
    }
  }

  public async startAlephiumSession(password: string): Promise<boolean> {
    if (this.session) {
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
        this.setSession(password, wallet.seed, wallet.mnemonic)
      } else {
        const wallet = walletOpen(password, walletEncrypted)
        this.setSession(password, wallet.seed, wallet.mnemonic)
      }

      return true
    } catch {
      return false
    }
  }

  public checkPassword(password: string): boolean {
    return this.session?.password === password
  }

  public async getBalance(address: string): Promise<AddressBalance> {
    const explorerProvider = await this.getExplorerProvider()
    const value = await explorerProvider.addresses.getAddressesAddressBalance(address)
    return value
  }

  public async getAddressTokens(address: string): Promise<string[]> {
    const explorerProvider = await this.getExplorerProvider()
    return await explorerProvider.addresses.getAddressesAddressTokens(address)
  }

  public async getAddressTokenBalance(address: string, tokenId: string): Promise<AddressBalance> {
    const explorerProvider = await this.getExplorerProvider()
    return await explorerProvider.addresses.getAddressesAddressTokensTokenIdBalance(address, tokenId)
  }

  public async getAddressTokenTransactions(address: string, tokenId: string): Promise<Transaction[]> {
    const explorerProvider = await this.getExplorerProvider()
    return await explorerProvider.addresses.getAddressesAddressTokensTokenIdTransactions(address, tokenId)
  }

  public async selectAlephiumAddress(address: string) {
    const addresses = await this.getAlephiumAddresses()
    console.log(`===== select: ${address} - ${JSON.stringify(addresses)}`)

    const defaultAddress = find(addresses, (addr) => addr.address === address)

    if (defaultAddress) {
      await this.store.setItem('defaultAddress', defaultAddress)
    }
  }

  deriveAddressAndPublicKey(seed: Buffer, forGroup?: number | undefined, addressIndex?: number | undefined, skipAddressIndexes?: number[]): AddressAndPublicKey {
    const addressAndKeys = deriveNewAddressData(seed, forGroup, addressIndex, skipAddressIndexes)
    return {
      address: addressAndKeys.address,
      publicKey: addressAndKeys.publicKey,
      addressIndex: addressAndKeys.addressIndex
    }
  }

  public async addAlephiumAddress(group?: number): Promise<AddressAndPublicKey | undefined> {
    if (!this.session?.seed) {
      return undefined
    } else {
      // do not store at the moment, but use public key and private key to sign
      // store later
      const addresses = await this.store.getItem('addresses') ?? []
      group = group || group === 0 ? ~~group : undefined

      let newAndDefaultAddress
      if (addresses) {
        group = group || group === 0 ? ~~group : undefined
        const skipIndexes = addresses.map((address) => address.addressIndex)
        newAndDefaultAddress = this.deriveAddressAndPublicKey(this.session.seed, group, undefined, skipIndexes)
        await this.store.setItem('addresses', [...addresses, newAndDefaultAddress])
      } else {
        if (group === undefined) {
          const seed = this.session.seed
          const skipIndexes: number[] = []
          const newAddresses = range(TOTAL_NUMBER_OF_GROUPS).map((group) => {
            const address = this.deriveAddressAndPublicKey(seed, group, undefined, skipIndexes)
            skipIndexes.push(address.addressIndex)
            return address
          })
          newAndDefaultAddress = newAddresses[0]
          await this.store.setItem('addresses', newAddresses)
        } else {
          newAndDefaultAddress = this.deriveAddressAndPublicKey(this.session.seed, group, 0)
          await this.store.setItem('addresses', [newAndDefaultAddress])
        }
      }

      await this.store.setItem('defaultAddress', newAndDefaultAddress)

      return newAndDefaultAddress
    }
  }

  matchGroup(address: string, group?: number): boolean {
    return !group || groupOfAddress(address) === group
  }

  public async getAlephiumDefaultAddress(group?: number): Promise<AddressAndPublicKey | undefined> {
    const defaultAddress = await this.store.getItem('defaultAddress')
    if (defaultAddress && this.matchGroup(defaultAddress.address, group)) {
      return defaultAddress
    } else {
      const addresses = await this.store.getItem('addresses')
      if (addresses) {
        const result = addresses.find((address) => this.matchGroup(address.address, group))
        if (result) {
          await this.store.setItem('defaultAddress', result)
        }

        return result
      }
    }
  }

  public lock() {
    this.session = undefined
  }

  public async reset() {
    await this.resetAddresses()
    this.session = undefined
  }

  // Get all transactions, maybe doesn't belong here
  public async getTransactions(address: string): Promise<Transaction[]> {
    const explorerProvider = await this.getExplorerProvider()
    return await explorerProvider.addresses.getAddressesAddressTransactions(address)
  }

  private setSession(password: string, seed: Buffer, mnemonic: string) {
    this.session = { password, seed, mnemonic }

    setTimeout(() => {
      this.lock()
      this.onAutoLock?.()
    }, SESSION_DURATION)
  }
}
