import { ArrayStorage } from "../../shared/storage"
import {
  Transaction,
  TransactionRequest,
  compareTransactions,
} from "../../shared/transactions"

export const transactionsStore = new ArrayStorage<Transaction>([], {
  namespace: "core:transactions",
  areaName: "local",
  compare: compareTransactions,
})

export const addTransaction = async (transaction: TransactionRequest) => {
  // sanity checks
  if (!transaction.hash) {
    return // dont throw
  }

  const newTransaction = {
    status: "RECEIVED" as const,
    timestamp: Date.now(),
    ...transaction,
  }

  return transactionsStore.push(newTransaction)
}
