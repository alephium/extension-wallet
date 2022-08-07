import { Balance } from "@alephium/web3/dist/src/api/api-alephium"

import { AddressAndPublicKey } from "../Address"
import { BaseWalletAccount } from "../wallet.model"

export type AccountMessage =
  | { type: "NEW_ACCOUNT"; data?: number }
  | {
      type: "NEW_ACCOUNT_RES"
      data: AddressAndPublicKey
    }
  | { type: "NEW_ACCOUNT_REJ"; data: { error: string } }
  | { type: "DISCONNECT_ACCOUNT" }
  | { type: "CONNECT_ACCOUNT"; data: { address: string } }
  | { type: "GET_ACCOUNTS"; data?: { showHidden: boolean } }
  | { type: "GET_ACCOUNTS_RES"; data: AddressAndPublicKey[] }
  | { type: "GET_SELECTED_ACCOUNT" }
  | {
      type: "GET_SELECTED_ACCOUNT_RES"
      data: AddressAndPublicKey | undefined
    }
  | { type: "GET_ACCOUNT_BALANCE"; data: { address: string } }
  | {
      type: "GET_ACCOUNT_BALANCE_RES"
      data: Balance
    }
  | { type: "DELETE_ACCOUNT"; data: BaseWalletAccount }
  | { type: "DELETE_ACCOUNT_RES" }
  | { type: "DELETE_ACCOUNT_REJ" }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE"
      data: { encryptedSecret: string }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE_RES"
      data: { encryptedSeedPhrase: string }
    }
