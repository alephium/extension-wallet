import join from "url-join"

import { Network } from "../../../shared/network"
import { Transaction, getTransactionsPerAccount } from "../../../shared/transactions"
import { WalletAccount } from "../../../shared/wallet.model"
import { fetchWithTimeout } from "../../utils/fetchWithTimeout"

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

export async function getLatestTransactions(
  accountsToPopulate: WalletAccount[],
  metadataTransactions: Transaction[],
) {
  const transactionsPerAccount = await getTransactionsPerAccount(accountsToPopulate, metadataTransactions)
  return Array.from(transactionsPerAccount.values()).flat()
}
