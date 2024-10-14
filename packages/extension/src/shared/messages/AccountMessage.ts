import { KeyType } from "@alephium/web3";
import {
  ArgentAccountType,
  BaseWalletAccount,
  WalletAccount,
} from "../wallet.model"

export type AccountMessage =
  | { type: "ALPH_NEW_ACCOUNT"; data: { networkId: string; keyType: KeyType; group?: number } }
  | {
      type: "ALPH_NEW_ACCOUNT_RES"
      data: {
        account: WalletAccount
        accounts: WalletAccount[]
      }
    }
  | { type: "ALPH_NEW_ACCOUNT_REJ"; data: { error: string } }
  | { type: "ALPH_NEW_LEDGER_ACCOUNT"; data: { account: WalletAccount } }
  | {
      type: "ALPH_NEW_LEDGER_ACCOUNT_RES"
      data: {
        account: BaseWalletAccount
      }
    }
  | { type: "ALPH_NEW_LEDGER_ACCOUNT_REJ"; data: { error: string } }
  | { type: "ALPH_GET_ACCOUNTS"; data?: { showHidden: boolean } }
  | { type: "ALPH_GET_ACCOUNTS_RES"; data: WalletAccount[] }
  | { type: "ALPH_CONNECT_ACCOUNT"; data?: BaseWalletAccount }
  | { type: "ALPH_CONNECT_ACCOUNT_RES"; data?: WalletAccount }
  | { type: "ALPH_DISCONNECT_ACCOUNT" }
  | { type: "ALPH_GET_SELECTED_ACCOUNT" }
  | { type: "ALPH_GET_SELECTED_ACCOUNT_RES"; data: WalletAccount | undefined }
  | { type: "ALPH_DELETE_ACCOUNT"; data: BaseWalletAccount }
  | { type: "ALPH_DELETE_ACCOUNT_RES" }
  | { type: "ALPH_DELETE_ACCOUNT_REJ" }
  | {
      type: "ALPH_UPGRADE_ACCOUNT"
      data: {
        wallet: BaseWalletAccount
        targetImplementationType?: ArgentAccountType
      }
    }
  | { type: "ALPH_UPGRADE_ACCOUNT_RES" }
  | { type: "ALPH_UPGRADE_ACCOUNT_REJ" }
  | {
      type: "ALPH_GET_ENCRYPTED_PRIVATE_KEY"
      data: { encryptedSecret: string }
    }
  | {
      type: "ALPH_GET_ENCRYPTED_PRIVATE_KEY_RES"
      data: { encryptedPrivateKey: string }
    }
  | {
      type: "ALPH_GET_ENCRYPTED_SEED_PHRASE"
      data: { encryptedSecret: string }
    }
  | {
      type: "ALPH_GET_ENCRYPTED_SEED_PHRASE_RES"
      data: { encryptedSeedPhrase: string }
    }
  | {
      type: "ALPH_DISCOVER_ACCOUNTS"
      data: { networkId: string }
    }
  | {
      type: "ALPH_DISCOVER_ACCOUNTS_RES"
      data: {
        accounts: WalletAccount[]
      }
    }
  | {
      type: "ALPH_DISCOVER_ACCOUNTS_REJ"
      data: { error: string }
    }
