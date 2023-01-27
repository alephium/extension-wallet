import { EnableOptionsBase, InteractiveSignerProvider } from "@alephium/web3"
import type { AccountInterface, ProviderInterface } from "starknet"
import type {
  AccountInterface as AccountInterface3,
  ProviderInterface as ProviderInterface3,
} from "starknet3"

import { Network } from "../shared/network"

export type AccountChangeEventHandler = (accounts: string[]) => void

export type NetworkChangeEventHandler = (network?: string) => void

export type WalletEventHandlers =
  | AccountChangeEventHandler
  | NetworkChangeEventHandler

export type WalletEvents =
  | {
      type: "accountsChanged"
      handler: AccountChangeEventHandler
    }
  | {
      type: "networkChanged"
      handler: NetworkChangeEventHandler
    }

// EIP-747:
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-747.md
export interface WatchAssetParameters {
  type: "ERC20" // The asset's interface, e.g. 'ERC20'
  options: {
    address: string // The hexadecimal StarkNet address of the token contract
    symbol?: string // A ticker symbol or shorthand, up to 5 alphanumerical characters
    decimals?: number // The number of asset decimals
    image?: string // A string url of the token logo
    name?: string // The name of the token - not in spec
  }
}

// EIP-3085
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3085.md

export interface AddStarknetChainParameters {
  id: string
  chainId: number
  chainName: string
  nodeUrl: string
  explorerApiUrl: string
  explorerUrl?: string

  nativeCurrency?: {
    name: string
    symbol: string // 2-6 characters long
    decimals: 18
  } // Currently ignored.
  iconUrls?: string[] // Currently ignored.
}

export interface SwitchStarknetChainParameter {
  chainId: string // A 0x-prefixed hexadecimal string
}

export type RpcMessage =
  | {
      type: "wallet_watchAsset"
      params: WatchAssetParameters
      result: boolean
    }
  | {
      type: "wallet_addStarknetChain"
      params: AddStarknetChainParameters
      result: boolean
    }
  | {
      type: "wallet_switchStarknetChain"
      params: SwitchStarknetChainParameter
      result: boolean
    }
  | {
      type: string
      params: any
      result: never
    }

export type EnableOptions = EnableOptionsBase & {
  showModal?: boolean
}

export interface AlephiumWindowObject
  extends InteractiveSignerProvider<EnableOptions> {
  id: string
  name: string
  icon: string
  version: string

  connectedAddress: string | undefined
  connectedNetworkId: string | undefined
  onDisconnected: (() => Promise<void>) | undefined

  enable(options?: EnableOptions): Promise<string>
  isPreauthorized(): Promise<boolean>
}

declare global {
  interface Window {
    alephium?: AlephiumWindowObject
  }
}
