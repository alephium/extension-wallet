import type { typedData } from "starknet"

import { ExtensionActionItem, TransactionResult } from "../actionQueue/types"
import { SignMessageParams, SignUnsignedTxParams, SignUnsignedTxResult } from "@alephium/web3"

export type ActionMessage =
  | { type: "ALPH_GET_ACTIONS" }
  | {
      type: "ALPH_GET_ACTIONS_RES"
      data: ExtensionActionItem[]
    }
  | {
      type: "ALPH_APPROVE_ACTION"
      data: { actionHash: string; additionalData?: any }
    }
  | {
      type: "ALPH_APPROVE_Transaction_ACTION"
      data: { actionHash: string; result: TransactionResult }
    }
  | { type: "ALPH_REJECT_ACTION"; data: { actionHash: string | string[], error: string } }
  | { type: "ALPH_SIGN_MESSAGE"; data: SignMessageParams & { networkId?: string, host: string } }
  | { type: "ALPH_SIGN_MESSAGE_RES"; data: { actionHash: string } }
  | { type: "ALPH_SIGN_MESSAGE_FAILURE"; data: { actionHash: string, error: string } }
  | {
      type: "ALPH_SIGN_MESSAGE_SUCCESS"
      data: { signature: string; actionHash: string }
    }
  | { type: "ALPH_SIGN_UNSIGNED_TX"; data: SignUnsignedTxParams & { networkId?: string, host: string } }
  | { type: "ALPH_SIGN_UNSIGNED_TX_RES"; data: { actionHash: string } }
  | { type: "ALPH_SIGN_UNSIGNED_TX_FAILURE"; data: { actionHash: string; error: string } }
  | { type: "ALPH_SIGN_UNSIGNED_TX_SUCCESS"; data: { result: SignUnsignedTxResult; actionHash: string } }
