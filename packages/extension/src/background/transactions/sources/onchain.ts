import { ExplorerProvider } from "@alephium/web3"
import { getNetwork } from "../../../shared/network"
import {
  Transaction,
  getInFlightTransactions,
} from "../../../shared/transactions"
import { getTransactionsStatusUpdate } from "../determineUpdates"

export async function getTransactionsUpdate(transactions: Transaction[]) {
  const transactionsToCheck = getInFlightTransactions(transactions)

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
        if (exception.message.endsWith("not found") && txCreatedSinceInMinutes >= 2) {
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

  return getTransactionsStatusUpdate(transactions, updatedTransactions)
}
