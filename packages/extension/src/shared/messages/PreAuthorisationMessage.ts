import { WalletAccountWithNetwork } from "../wallet.model"

export type PreAuthorisationMessage =
  | { type: "CONNECT_DAPP"; data: { host: string } }
  | { type: "CONNECT_DAPP_RES"; data: WalletAccountWithNetwork }
  | { type: "IS_PREAUTHORIZED"; data: string }
  | { type: "IS_PREAUTHORIZED_RES"; data: boolean }
  | {
      type: "REJECT_PREAUTHORIZATION"
      data: { host: string; actionHash: string }
    }
