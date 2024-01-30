import { transactionsStore } from "../../shared/transactions/store"
import { runAddedHandlers, runChangedStatusHandlers } from "./onupdate"

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
