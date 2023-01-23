import type { typedData } from "starknet"

import { ExtensionActionItem, TransactionResult } from "../actionQueue/types"

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
  | { type: "SIGN_MESSAGE"; data: typedData.TypedData }
  | { type: "SIGN_MESSAGE_RES"; data: { actionHash: string } }
  | { type: "SIGNATURE_FAILURE"; data: { actionHash: string } }
  | {
      type: "SIGNATURE_SUCCESS"
      data: { r: string; s: string; actionHash: string }
    }
