import { uniqWith } from "lodash-es"

import { compareTransactions, getInFlightTransactions, TRANSACTION_STATUSES_TO_TRACK } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/wallet.service"
import { getPruneTransactions, getTransactionsUpdate, getUpdatesFromLatestTransactions, storeTransactionUpdates } from "./sources/onchain"
import { getLatestTransactions } from "./sources/voyager"
import { transactionsStore } from "../../shared/transactions/store"
import { partition } from "lodash"

export interface TransactionTracker {
  loadHistory: (accountsToPopulate: WalletAccount[]) => Promise<void>
  update: () => Promise<boolean>
  prune: () => Promise<void>
}

export const transactionTracker: TransactionTracker = {
  async loadHistory(accountsToPopulate: WalletAccount[]) {
    const existingTransactions = await transactionsStore.get()
    const uniqAccounts = uniqWith(accountsToPopulate, accountsEqual)
    const latestTransactions = await getLatestTransactions(uniqAccounts, existingTransactions)
    const transactionUpdates = getUpdatesFromLatestTransactions(existingTransactions, latestTransactions)
    await storeTransactionUpdates(transactionUpdates)
  },
  async update() {
    const allTransactions = await transactionsStore.get()
    const pendingTransactions = getInFlightTransactions(allTransactions)
    const updatedTransactions = await getTransactionsUpdate(pendingTransactions)
    const [toBeRemoved, toBeStored] = partition(updatedTransactions, (tx) => tx.status === "REMOVED_FROM_MEMPOOL")

    await storeTransactionUpdates({ toBeRemoved, toBeStored })

    const hasPendingTransactions = pendingTransactions.some((pendingTx) => {
      const updatedTx = updatedTransactions.find((tx) => compareTransactions(pendingTx, tx))
      return updatedTx === undefined || TRANSACTION_STATUSES_TO_TRACK.includes(updatedTx.status)
    })
    return hasPendingTransactions
  },
  async prune() {
    const allTransactions = await transactionsStore.get()
    const transactionUpdates = getPruneTransactions(allTransactions)
    console.log(`Pruning ${transactionUpdates.toBeRemoved.length} transactions`)
    await storeTransactionUpdates(transactionUpdates)
  }
}
