import { Account, SignerProvider } from '@alephium/web3'

import { Network } from '../shared/networks'

export type AccountChangeEventHandler = (accounts: string[]) => Promise<void> | void

export type NetworkChangeEventHandler = (network: Network) => Promise<void> | void

export type WalletEvents =
  | {
      type: 'addressesChanged'
      handler: AccountChangeEventHandler
    }
  | {
      type: 'networkChanged'
      handler: NetworkChangeEventHandler
    }

export interface AlephiumWindowObject extends SignerProvider {
  id: 'alephium'
  name: 'Alephium'
  icon: string
  isConnected: boolean
  currentNetwork: string

  enable(options?: { showModal?: boolean }): Promise<string[]>
  isPreauthorized(): Promise<boolean>
  on(event: WalletEvents['type'], handleEvent: WalletEvents['handler']): void
  off(event: WalletEvents['type'], handleEvent: WalletEvents['handler']): void
  updateProviders: NetworkChangeEventHandler
  defaultAddress?: Account
}

declare global {
  interface Window {
    // Inspired by EIP-5749: https://eips.ethereum.org/EIPS/eip-5749
    alephiumProviders?: Record<string, AlephiumWindowObject>
  }
}
