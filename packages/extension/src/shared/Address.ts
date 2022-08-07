import { TOTAL_NUMBER_OF_GROUPS, addressToGroup } from "@alephium/sdk"
import { AddressInfo } from "@alephium/sdk/api/explorer"

export type TransactionType = "consolidation" | "transfer" | "sweep"
export type TimeInMs = number

export type AddressSettings = {
  isMain: boolean
  label?: string
  color?: string
}

export type AddressHash = string

export type AddressMetadata = AddressSettings & {
  index: number
}

export class Address {
  readonly hash: AddressHash
  readonly shortHash: string
  readonly publicKey: string
  readonly group: number
  readonly index: number

  settings: AddressSettings
  details: AddressInfo
  availableBalance: bigint
  lastUsed?: TimeInMs

  constructor(
    hash: string,
    publicKey: string,
    index: number,
    settings: AddressSettings,
  ) {
    this.hash = hash
    this.shortHash = `${this.hash.substring(0, 10)}...`
    this.publicKey = publicKey
    this.group = addressToGroup(hash, TOTAL_NUMBER_OF_GROUPS)
    this.index = index
    this.settings = settings
    this.details = {
      balance: "",
      lockedBalance: "",
      txNumber: 0,
    }
    this.availableBalance = BigInt(0)
  }
}

export declare type AddressAndPublicKey = {
  address: string
  publicKey: string
  addressIndex: number
}
