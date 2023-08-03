import { uniqWith } from "lodash-es"

import { getInFlightTransactions } from "../../shared/transactions"
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
    const updatedTransactions = await getTransactionsUpdate(
      // is smart enough to filter for just the pending transactions, as the rest needs no update
      allTransactions,
    )
    const [toBeRemoved, toBeKept] = partition(updatedTransactions, (tx) => tx.status === "REMOVED_FROM_MEMPOOL")
    await transactionsStore.remove((tx) => toBeRemoved.some((toBeRemovedTx) => tx.hash === toBeRemovedTx.hash))
    await transactionsStore.push(toBeKept)
    const hasPendingTransactions =
      getInFlightTransactions(allTransactions).length > 0
    return hasPendingTransactions
  },
}
