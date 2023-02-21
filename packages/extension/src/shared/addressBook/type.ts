import { KeyType } from "@alephium/web3"

export interface AddressBookContactNoId {
  name: string
  networkId: string
  address: string
  keyType: KeyType
}

export interface AddressBookContact extends AddressBookContactNoId {
  id: string
}
