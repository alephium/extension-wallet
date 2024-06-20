import { isString } from "lodash-es"

import { ExtensionActionItem } from "../../shared/actionQueue/types"
import { sendMessage, waitForMessage } from "../../shared/messages"
import { AllowArray } from "../../shared/storage/types"

export const getActions = async () => {
  sendMessage({ type: "ALPH_GET_ACTIONS" })
  return waitForMessage("ALPH_GET_ACTIONS_RES")
}

export const approveAction = (action: ExtensionActionItem | string, additionalData?: any) => {
  const actionHash = isString(action) ? action : action.meta.hash
  return sendMessage({ type: "ALPH_APPROVE_ACTION", data: { actionHash, additionalData } })
}

export const rejectAction = (actionHash: AllowArray<string>, error: string) => {
  return sendMessage({ type: "ALPH_REJECT_ACTION", data: { actionHash, error } })
}
