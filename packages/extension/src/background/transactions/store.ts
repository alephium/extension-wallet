import { differenceWith } from "lodash-es"

import { ArrayStorage } from "../../shared/storage"
import { StorageChange } from "../../shared/storage/types"
import {
  Transaction,
  TransactionRequest,
  compareTransactions,
} from "../../shared/transactions"
import { runAddedHandlers, runChangedStatusHandlers } from "./onupdate"
import { checkTransactionHash } from "./transactionExecution"

export const transactionsStore = new ArrayStorage<Transaction>([], {
  namespace: "core:transactions",
  areaName: "local",
  compare: compareTransactions,
})

export const addTransaction = async (transaction: TransactionRequest) => {
  // sanity checks
  if (!checkTransactionHash(transaction.hash)) {
    return // dont throw
  }

  const newTransaction = {
    status: "RECEIVED" as const,
    timestamp: Date.now(),
    ...transaction,
  }

  return transactionsStore.push(newTransaction)
}

export const getUpdatedTransactionsForChangeSet = (
  changeSet: StorageChange<Transaction[]>,
) => {
  const updatedTransactions = differenceWith(
    changeSet.oldValue ?? [],
    changeSet.newValue ?? [],
    equalTransactionWithStatus,
  )
  return updatedTransactions
}

const equalTransactionWithStatus = (
  a: Transaction,
  b: Transaction,
): boolean => {
  return compareTransactions(a, b) && a.status === b.status
}

transactionsStore.subscribe((_, changeSet) => {
  const findOldTransaction = (hash: string) => changeSet.oldValue?.find(
    (oldTransaction) => oldTransaction.hash === hash,
  )

  /** note this includes where all transactions are initially loaded in the store */
  const newTransactions = changeSet.newValue?.flatMap(
    (newTransaction) => {
      const oldTransaction = findOldTransaction(newTransaction.hash)
      if (!oldTransaction) {
        return newTransaction
      }
      return []
    },
  )

  /** transactions which already existed in the store, and have now changed status */
  const changedStatusTransactions = changeSet.newValue?.flatMap(
    (newTransaction) => {
      const oldTransaction = findOldTransaction(newTransaction.hash)
      if (oldTransaction && oldTransaction.status !== newTransaction.status) {
        return newTransaction
      }
      return []
    },
  )

  if (newTransactions && newTransactions.length > 0) {
    runAddedHandlers(newTransactions)
  }

  if (changedStatusTransactions && changedStatusTransactions.length > 0) {
    runChangedStatusHandlers(changedStatusTransactions)
  }
})
