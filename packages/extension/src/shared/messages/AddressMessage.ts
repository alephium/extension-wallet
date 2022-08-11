import { Balance } from "@alephium/web3/dist/src/api/api-alephium"

import { AddressAndPublicKey } from "../Address"

export type AddressMessage =
  | { type: "NEW_ADDRESS"; data?: number }
  | {
    type: "NEW_ADDRESS_RES"
    data: AddressAndPublicKey
  }
  | { type: "NEW_ADDRESS_REJ"; data: { error: string } }
  | { type: "DISCONNECT_ADDRESS" }
  | { type: "CONNECT_ADDRESS"; data: { address: string } }
  | { type: "GET_ADDRESSES"; data?: { showHidden: boolean } }
  | { type: "GET_ADDRESSES_RES"; data: AddressAndPublicKey[] }
  | { type: "GET_SELECTED_ADDRESS" }
  | {
    type: "GET_SELECTED_ADDRESS_RES"
    data: AddressAndPublicKey | undefined
  }
  | { type: "GET_ADDRESS_BALANCE"; data: { address: string } }
  | {
    type: "GET_ADDRESS_BALANCE_RES"
    data: Balance
  }
  | { type: "DELETE_ADDRESS"; data: { address: string } }
  | { type: "DELETE_ADDRESS_RES" }
  | { type: "DELETE_ADDRESS_REJ" }
  | {
    type: "GET_ENCRYPTED_SEED_PHRASE"
    data: { encryptedSecret: string }
  }
  | {
    type: "GET_ENCRYPTED_SEED_PHRASE_RES"
    data: { encryptedSeedPhrase: string }
  }
