import { KeyType } from "@alephium/web3";
import { RequestOptions } from "../../inpage/inpage.model";
import { WalletAccountWithNetwork } from "../wallet.model"

export type PreAuthorisationMessage =
  | { type: "ALPH_CONNECT_DAPP"; data: { host: string, networkId?: string, group?: number, keyType?: KeyType } }
  | { type: "ALPH_CONNECT_DAPP_RES"; data: WalletAccountWithNetwork }
  | { type: "ALPH_IS_PREAUTHORIZED"; data: RequestOptions }
  | { type: "ALPH_IS_PREAUTHORIZED_RES"; data: boolean }
  | {
      type: "ALPH_REJECT_PREAUTHORIZATION"
      data: { host: string; actionHash: string }
    }
  | { type: "ALPH_REMOVE_PREAUTHORIZATION"; data: string }
  | { type: "ALPH_REMOVE_PREAUTHORIZATION_RES" }
