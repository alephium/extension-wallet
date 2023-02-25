import { KeyType } from "@alephium/web3";
import { WalletAccountWithNetwork } from "../wallet.model"

export type PreAuthorisationMessage =
  | { type: "CONNECT_DAPP"; data: { host: string, networkId?: string, group?: number, keyType?: KeyType } }
  | { type: "CONNECT_DAPP_RES"; data: WalletAccountWithNetwork }
  | { type: "IS_PREAUTHORIZED"; data: string }
  | { type: "IS_PREAUTHORIZED_RES"; data: boolean }
  | {
      type: "REJECT_PREAUTHORIZATION"
      data: { host: string; actionHash: string }
    }
  | { type: "REMOVE_PREAUTHORIZATION"; data: string }
  | { type: "REMOVE_PREAUTHORIZATION_RES" }
