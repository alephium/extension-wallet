import { explorer, ExplorerProvider } from "@alephium/web3"
import { getNetwork } from "../../../shared/network"
import { compareTransactions, getInFlightTransactions, LatestTransaction, Transaction } from "../../../shared/transactions"
import { transactionsStore } from "../../../shared/transactions/store"
import { mapAlephiumTransactionToTransaction } from "../../../shared/transactions/transformers"
import { getTransactionsStatusUpdate } from "../determineUpdates"
import { groupBy, forEach } from "lodash"

interface TransactionUpdates<T = Transaction> {
  toBeRemoved: Transaction[]
  toBeStored: T[]
}

// See https://github.com/alephium/alephium-frontend/issues/1367
export const isConfirmedTx = (
  tx: explorer.TransactionLike,
): tx is explorer.AcceptedTransaction =>
  "blockHash" in tx && !tx.inputs?.some((input) => input.txHashRef === undefined)

export async function getTransactionsUpdate(transactionsToCheck: Transaction[]) {

  // as this function tends to run into 429 errors, we'll simply keep the old status when it fails
  // TODO: we should add a cooldown when user run into 429 errors
  const fetchedTransactions: PromiseSettledResult<Transaction>[] = await Promise.allSettled(
    transactionsToCheck.map(async (transaction) => {
      const network = await getNetwork(transaction.account.networkId)
      const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
      const txDate = new Date(transaction.timestamp)
      const txCreatedSinceInMinutes = (new Date().valueOf() - txDate.valueOf()) / 1000 / 60
      try {
        const updatedTransaction = await explorerProvider.transactions.getTransactionsTransactionHash(transaction.hash)
        const status = updatedTransaction.type === "Accepted" ? "ACCEPTED_ON_CHAIN" : "ACCEPTED_ON_MEMPOOL"
        return { ...transaction, status }
      } catch (exception: any) {
        // If the transaction is not found and it has been created for more than 2 minutes
        // we can assume it has been removed from the mempool
        if (exception.message.includes("not found") && txCreatedSinceInMinutes >= 2) {
          return { ...transaction, status: 'REMOVED_FROM_MEMPOOL' }
        } else {
          throw exception
        }
      }
    })
  )

  const updatedTransactions = fetchedTransactions.reduce<Transaction[]>(
    (acc, transaction) => {
      if (transaction.status === "fulfilled") {
        acc.push(transaction.value)
      }
      return acc
    },
    [],
  )

  return getTransactionsStatusUpdate(transactionsToCheck, updatedTransactions)
}

export function getUpdatesFromLatestTransactions(
  existingTransactions: Transaction[],
  latestTransactions: LatestTransaction[]
): TransactionUpdates<LatestTransaction> {
  const pendingTransactions = getInFlightTransactions(existingTransactions)

  // Remove all pending tx that are part of the latest txs
  const toBeRemoved = pendingTransactions.filter((pendingTx) => {
    return !!latestTransactions.find((tx) => compareTransactions(pendingTx, tx))
  })

  // Store all latest tx that are not part of the existing txs, except that
  // they are part of the pending txs
  const toBeStored = latestTransactions.filter((latestTx) => {
    return !existingTransactions.find((tx) => compareTransactions(latestTx, tx)) ||
      !!pendingTransactions.find((tx) => compareTransactions(latestTx, tx))
  })

  return { toBeRemoved, toBeStored }
}

export function getPruneTransactions(
  existingTransactions: Transaction[],
): TransactionUpdates {
  const maxPersistedTxsPerWalletAccount = 25
  const transactionsByWalletAccount = groupBy(existingTransactions, (tx) => `${tx.account.address}-${tx.account.networkId}`)
  const transactionsToPrune: Transaction[] = []
  forEach(transactionsByWalletAccount, (transactionsPerWalletAccount, _) => {
    if (transactionsPerWalletAccount.length > maxPersistedTxsPerWalletAccount) {
      const sortedTransactionsPerAccount = transactionsPerWalletAccount.sort((a, b) => b.timestamp - a.timestamp)
      transactionsToPrune.push(...sortedTransactionsPerAccount.slice(maxPersistedTxsPerWalletAccount))
    }
  })

  return { toBeRemoved: transactionsToPrune, toBeStored: [] }
}

export async function storeTransactionUpdates(transactionUpdates: TransactionUpdates<Transaction | LatestTransaction>) {
  if (transactionUpdates.toBeRemoved.length > 0) {
    await transactionsStore.remove((tx) =>
      transactionUpdates.toBeRemoved.some((toBeRemovedTx) => tx.hash === toBeRemovedTx.hash))
  }

  if (transactionUpdates.toBeStored.length > 0) {
    const transactionsToStore = await Promise.all(transactionUpdates.toBeStored.map(async (transaction) => {
      if ("status" in transaction) {
        return transaction
      }

      const network = await getNetwork(transaction.account.networkId)
      const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
      const fullTransaction = await explorerProvider.transactions.getTransactionsTransactionHash(transaction.hash)
      if (!isConfirmedTx(fullTransaction)) {
        throw new Error(`Expected confirmed transaction for ${transaction.hash}`)
      }
      return mapAlephiumTransactionToTransaction(
        fullTransaction,
        transaction.account,
        transaction.meta,
      )
    }))

    await transactionsStore.push(transactionsToStore)
  }
}
