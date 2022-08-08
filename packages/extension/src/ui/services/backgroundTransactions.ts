import { sendMessage, waitForMessage } from "../../shared/messages"
import { TransactionPayload } from "../../shared/transactions"

export const getAlephiumTransactions = async (address: string) => {
  sendMessage({ type: "GET_TRANSACTIONS", data: { address } })
  return await waitForMessage("GET_TRANSACTIONS_RES")
}

export const executeAlephiumTransaction = (data: TransactionPayload) => {
  sendMessage({ type: "EXECUTE_TRANSACTION", data })
}
