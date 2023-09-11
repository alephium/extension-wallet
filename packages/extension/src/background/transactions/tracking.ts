import { uniqWith } from "lodash-es"

import { compareTransactions, getInFlightTransactions, TRANSACTION_STATUSES_TO_TRACK } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/wallet.service"
import { getTransactionsUpdate } from "./sources/onchain"
import { getTransactionHistory } from "./sources/voyager"
import { transactionsStore } from "./store"
import { partition } from "lodash"

export interface TransactionTracker {
  loadHistory: (accountsToPopulate: WalletAccount[]) => Promise<void>
  update: () => Promise<boolean>
}

export const transactionTracker: TransactionTracker = {
  async loadHistory(accountsToPopulate: WalletAccount[]) {
    const allTransactions = await transactionsStore.get()
    const uniqAccounts = uniqWith(accountsToPopulate, accountsEqual)
    const historyTransactions = await getTransactionHistory(
      uniqAccounts,
      allTransactions,
    )
    return transactionsStore.push(historyTransactions)
  },
  async update() {
    const allTransactions = await transactionsStore.get()
    const pendingTransactions = getInFlightTransactions(allTransactions)
    const updatedTransactions = await getTransactionsUpdate(
      // is smart enough to filter for just the pending transactions, as the rest needs no update
      allTransactions,
    )
    const [toBeRemoved, toBeKept] = partition(updatedTransactions, (tx) => tx.status === "REMOVED_FROM_MEMPOOL")
    if (toBeRemoved.length > 0) {
      await transactionsStore.remove((tx) => toBeRemoved.some((toBeRemovedTx) => tx.hash === toBeRemovedTx.hash))
    }
    await transactionsStore.push(toBeKept)

    const hasPendingTransactions = pendingTransactions.some((pendingTx) => {
      const updatedTx = updatedTransactions.find((tx) => compareTransactions(pendingTx, tx))
      return updatedTx === undefined || TRANSACTION_STATUSES_TO_TRACK.includes(updatedTx.status)
    })
    return hasPendingTransactions
  },
}
