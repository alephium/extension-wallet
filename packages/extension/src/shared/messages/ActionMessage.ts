import type { typedData } from "starknet"

import { ExtensionActionItem, TransactionResult } from "../actionQueue/types"
import { SignMessageParams, SignUnsignedTxParams, SignUnsignedTxResult } from "@alephium/web3"

export type ActionMessage =
  | { type: "GET_ACTIONS" }
  | {
      type: "GET_ACTIONS_RES"
      data: ExtensionActionItem[]
    }
  | {
      type: "APPROVE_ACTION"
      data: { actionHash: string; additionalData?: any }
    }
  | {
      type: "APPROVE_Transaction_ACTION"
      data: { actionHash: string; result: TransactionResult }
    }
  | { type: "REJECT_ACTION"; data: { actionHash: string | string[] } }
  | { type: "ALPH_SIGN_MESSAGE"; data: SignMessageParams & { networkId?: string, host: string } }
  | { type: "ALPH_SIGN_RES"; data: { actionHash: string } }
  | { type: "ALPH_SIGN_UNSIGNED_TX"; data: SignUnsignedTxParams & { networkId?: string, host: string } }
  | { type: "ALPH_SIGN_UNSIGNED_TX_RES"; data: { result: SignUnsignedTxResult; actionHash: string } }
  | { type: "SIGNATURE_FAILURE"; data: { actionHash: string, error?: string } }
  | {
      type: "SIGNATURE_SUCCESS"
      data: { signature: string; actionHash: string }
    }
