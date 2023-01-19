import { Account, InteractiveSignerProvider, EnableOptionsBase } from '@alephium/web3'

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

export type EnableOptions = EnableOptionsBase & {
  showModal?: boolean
}

export interface AlephiumWindowObject extends InteractiveSignerProvider<EnableOptions> {
  id: 'alephium'
  name: 'Alephium'
  icon: string
  isConnected: boolean
  currentNetwork: string

  enable(options?: EnableOptions): Promise<void>
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
