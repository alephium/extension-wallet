import { ExplorerProvider } from "@alephium/web3"
import join from "url-join"

import { Network, getNetwork } from "../../../shared/network"
import { Transaction, compareTransactions } from "../../../shared/transactions"
import { WalletAccount } from "../../../shared/wallet.model"
import { fetchWithTimeout } from "../../utils/fetchWithTimeout"
import { mapAlephiumTransactionToTransaction } from "../transformers"
import { Transaction as AlephiumTransaction } from '@alephium/web3/dist/src/api/api-explorer'

export interface VoyagerTransaction {
  blockId: string
  entry_point_type: string | null
  globalIndex?: number
  hash: string
  index: number
  signature: string[] | null
  timestamp: number
  to: string
  type: string
}

export const fetchVoyagerTransactions = async (
  address: string,
  network: Network,
): Promise<VoyagerTransaction[]> => {
  const { explorerUrl } = network
  if (!explorerUrl) {
    return []
  }
  const response = await fetchWithTimeout(
    join(explorerUrl, `api/txns?to=${address}`),
  )
  const { items } = await response.json()
  return items
}

export async function getTransactionHistory(
  accountsToPopulate: WalletAccount[],
  metadataTransactions: Transaction[],
) {
  const transactionsPerAccount = await Promise.all(
    accountsToPopulate.map(async (account) => {
      const network = await getNetwork(account.networkId)
      const explorerProvider = new ExplorerProvider(network.explorerApiUrl)

      // confirmed txs
      const transactions: AlephiumTransaction[] = await explorerProvider.addresses.getAddressesAddressTransactions(account.address)

      return transactions.map((transaction) =>
        mapAlephiumTransactionToTransaction(
          transaction,
          account,
          metadataTransactions.find((tx) =>
            compareTransactions(tx, {
              hash: transaction.hash,
              account: { networkId: account.networkId },
            }),
          )?.meta,
        ),
      )
    }),
  )
  return transactionsPerAccount.flat()
}
