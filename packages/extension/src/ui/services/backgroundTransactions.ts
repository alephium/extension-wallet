import { sendMessage, waitForMessage } from '../../shared/messages'
import { TransactionPayload, TransactionResult } from '../../shared/transactions'

export const getAlephiumTransactions = async (address: string) => {
  sendMessage({ type: 'GET_TRANSACTIONS', data: { address } })
  return await waitForMessage('GET_TRANSACTIONS_RES')
}

export const getAddressTokenTransactions = async (address: string, tokenId: string) => {
  sendMessage({ type: 'GET_ADDRESS_TOKEN_TRANSACTIONS', data: { address, tokenId } })
  return await waitForMessage('GET_ADDRESS_TOKEN_TRANSACTIONS_RES')
}

export const executeAlephiumTransaction = async (data: TransactionPayload): Promise<TransactionResult> => {
  sendMessage({ type: 'EXECUTE_TRANSACTION', data })
  const { actionHash } = await waitForMessage('EXECUTE_TRANSACTION_RES')
  const { txResult } = await waitForMessage('TRANSACTION_SUCCESS', ({ data }) => data.actionHash === actionHash)
  return txResult
}
