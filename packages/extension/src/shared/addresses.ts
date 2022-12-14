import { TOTAL_NUMBER_OF_GROUPS, addressToGroup } from '@alephium/sdk'
import { AddressInfo } from '@alephium/sdk/api/explorer'
import { Schema, object, string } from 'yup'

export type TransactionType = 'consolidation' | 'transfer' | 'sweep'
export type TimeInMs = number

export type AddressHash = string

export class Address {
  readonly hash: AddressHash
  readonly shortHash: string
  readonly publicKey: string
  readonly group: number
  readonly index: number

  details: AddressInfo
  availableBalance: bigint
  lastUsed?: TimeInMs

  constructor(hash: string, publicKey: string, index: number) {
    this.hash = hash
    this.shortHash = `${this.hash.substring(0, 10)}...`
    this.publicKey = publicKey
    this.group = addressToGroup(hash, TOTAL_NUMBER_OF_GROUPS)
    this.index = index
    this.details = {
      balance: '',
      lockedBalance: '',
      txNumber: 0
    }
    this.availableBalance = BigInt(0)
  }
}

export declare type AddressAndPublicKey = {
  address: string
  publicKey: string
  addressIndex: number
}

export type AddressMetadata = {
  name: string
  color: string
}

type AddressGroup = {
  group?: string
}

export const AddressMetadataSchema: Schema<AddressMetadata> = object().required().shape({
  name: string().required(),
  color: string().required()
})

export const AddressGroupSchema: Schema<AddressGroup> = object({
  group: string()
    .required()
    .test((g) => {
      if (!g) {
        return false
      }

      const groupInt = parseInt(g)
      return !isNaN(groupInt) && (groupInt >= 0 || groupInt <= 3)
    })
})

export type AddressMetadataWithGroup = AddressMetadata & AddressGroup

// TODO: How to merge the two above while infering the types? (using concat?)
export const AddressMetadataWithGroupSchema: Schema<AddressMetadataWithGroup> = object().required().shape({
  name: string().required(),
  color: string().required(),
  group: string()
})
