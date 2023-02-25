import { SignTransferTxParams, SignUnsignedTxParams } from "@alephium/web3"
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { TransactionWithAddress } from '../../shared/alephium-transactions'

import { executeTransaction } from "./backgroundTransactions"
import { formatDate } from './dates'

export const sendTransferTransaction = (data: SignTransferTxParams & { networkId: string, host?: string }) => {
  executeTransaction({
    type: "TRANSFER",
    params: data,
    salt: Math.random().toString()
  })
}

export const sendUnsignedTxTransaction = (data: SignUnsignedTxParams & { networkId: string, host?: string }) => {
  executeTransaction({
    type: "UNSIGNED_TX",
    params: data,
    salt: Math.random().toString()
  })
}

export const orderTransactionsPerDay = <T extends Transaction | TransactionWithAddress>(transactions: T[]) => {
  const orderedTXs: Record<string, T[]> = {}

  for (const tx of transactions) {
    const date = new Date(tx.timestamp)
    const dateLabel = formatDate(date)
    orderedTXs[dateLabel] ||= []
    orderedTXs[dateLabel].push(tx)
  }

  return orderedTXs
}
