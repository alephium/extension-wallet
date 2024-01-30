import { ExplorerProvider } from "@alephium/web3"
import { memoize } from "lodash-es"
import { useEffect, useMemo, useState } from "react"
import { Transaction as AlephiumTransaction } from '@alephium/web3/dist/src/api/api-explorer'
import { transactionsStore } from "../../../shared/transactions/store"
import { getNetwork } from "../../../shared/network"
import { useArrayStorage } from "../../../shared/storage/hooks"
import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import {
  accountsEqual,
  getAccountIdentifier,
} from "../../../shared/wallet.service"

type UseAccountTransactions = (account?: BaseWalletAccount) => {
  transactions: Transaction[]
  pendingTransactions: Transaction[]
}

const byAccountSelector = memoize(
  (account?: BaseWalletAccount) => (transaction: Transaction) =>
    Boolean(account && accountsEqual(transaction.account, account)),
  (account) => (account ? getAccountIdentifier(account) : "unknown-account"),
)

export const useAccountTransactions: UseAccountTransactions = (account) => {
  const transactions = useArrayStorage(
    transactionsStore,
    byAccountSelector(account),
  )

  const sortedTransactions = useMemo(
    () => transactions.sort((a, b) => b.timestamp - a.timestamp),
    [transactions],
  )

  const pendingTransactions = sortedTransactions.filter(
    ({ status }) => status === "RECEIVED" || status === "ACCEPTED_ON_MEMPOOL",
  )

  return { transactions, pendingTransactions }
}

export const useAccountTransactionsAlph = (account: WalletAccount) => {
  const [transactions, setTransactions] = useState<AlephiumTransaction[]>([])

  useEffect(() => {
    const getTransactions = async () => {
      const txs = await getAccountTransactions(account)
      txs && setTransactions(txs)
    }
    getTransactions()
  }, [account, setTransactions])

  return transactions
}

const getAccountTransactions = async (account: WalletAccount) => {
  const network = await getNetwork(account.networkId)
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  return await explorerProvider.addresses.getAddressesAddressTransactions(account.address)
}
