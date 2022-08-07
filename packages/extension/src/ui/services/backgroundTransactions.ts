import { AlephiumTransactionPayload } from "../../shared/actionQueue"
import { sendMessage, waitForMessage } from "../../shared/messages"

export const getAlephiumTransactions = async (address: string) => {
  sendMessage({ type: "GET_TRANSACTIONS", data: { address } })
  return await waitForMessage("GET_TRANSACTIONS_RES")
}

export const executeAlephiumTransaction = (
  data: AlephiumTransactionPayload,
) => {
  sendMessage({ type: "EXECUTE_TRANSACTION", data })
}
