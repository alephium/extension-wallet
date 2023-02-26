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
      const updatedTransaction = await explorerProvider.transactions.getTransactionsTransactionHash(transaction.hash)

      const status = updatedTransaction.type === "UnconfirmedTransaction" ? "PENDING" : "ACCEPTED_ON_CHAIN"
      return { ...transaction, status }
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
