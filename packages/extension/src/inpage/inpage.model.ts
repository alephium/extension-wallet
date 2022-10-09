import {
  Account,
  SignerProvider
} from '@alephium/web3'
import { defaultNetworks } from '../shared/networks'
import { alephiumIcon } from './icon'

export type AccountChangeEventHandler = (accounts: string[]) => void

export type NetworkChangeEventHandler = (network?: string) => void

export type WalletEvents =
  | {
    type: 'addressesChanged'
    handler: AccountChangeEventHandler
  }
  | {
    type: 'networkChanged'
    handler: NetworkChangeEventHandler
  }

export abstract class AlephiumWindowObject extends SignerProvider {
  id = "alephium"
  name = 'Alephium'
  icon = alephiumIcon
  isConnected = false
  currentNetwork = defaultNetworks[0].id

  abstract enable(options?: { showModal?: boolean }): Promise<string[]>
  abstract isPreauthorized(): Promise<boolean>
  abstract on(event: WalletEvents['type'], handleEvent: WalletEvents['handler']): void
  abstract off(event: WalletEvents['type'], handleEvent: WalletEvents['handler']): void
  defaultAddress?: Account
}

declare global {
  interface Window {
    // Inspired by EIP-5749: https://eips.ethereum.org/EIPS/eip-5749
    alephiumProviders?: Record<string, AlephiumWindowObject>
  }
}
