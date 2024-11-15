import { AlephiumWindowObject } from "@alephium/get-extension-wallet"
import { Address, KeyType } from "@alephium/web3"
import { Event, UnsignedEvent } from "nostr-tools"

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
declare global {
  interface Window {
    // Inspired by EIP-5749: https://eips.ethereum.org/EIPS/eip-5749
    alephiumProviders?: Record<string, AlephiumWindowObject>
    nostr?: NostrObject
  }

  interface WindowEventMap {
    'announceAlephiumProvider': CustomEvent,
    'requestAlephiumProvider': Event
  }
}

export interface NostrObject {
  getPublicKey(): Promise<string>
  signEvent(t: UnsignedEvent): Promise<Event>
}

export interface RequestOptions {
  host: string
  address?: Address
  addressGroup?: number
  keyType?: KeyType
  networkId?: string
}
