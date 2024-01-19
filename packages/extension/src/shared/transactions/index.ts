import { ExplorerProvider } from "@alephium/web3"
//import { getAccounts } from "../../shared/account/store"
import { lowerCase, upperFirst } from "lodash-es"
import { Call } from "starknet"
import { ReviewTransactionResult } from "../actionQueue/types"
import { WalletAccount } from "../wallet.model"
import { AlephiumExplorerTransaction } from "../explorer/type"
import { mapAlephiumTransactionToTransaction } from "./transformers"
import { Transaction as AlephiumTransaction } from '@alephium/web3/dist/src/api/api-explorer'
import { getNetwork } from "../network"

export type Status = 'NOT_RECEIVED' | 'RECEIVED' | 'PENDING' | 'ACCEPTED_ON_MEMPOOL' | 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_CHAIN' | 'REJECTED' | 'REMOVED_FROM_MEMPOOL';

// Global Constants for Transactions
export const SUCCESS_STATUSES: Status[] = [
  "ACCEPTED_ON_MEMPOOL",
  "ACCEPTED_ON_CHAIN",
  "ACCEPTED_ON_L2",
  "PENDING",
]

export const TRANSACTION_STATUSES_TO_TRACK: Status[] = [
  "RECEIVED",
  "ACCEPTED_ON_MEMPOOL",
  "NOT_RECEIVED",
]

export interface TransactionMeta {
  title?: string
  subTitle?: string
  transactions?: Call | Call[] // TODO: remove this
  type?: string // TODO: in future can be DECLARE | DEPLOY | CALL
  request?: ReviewTransactionResult
  explorer?: AlephiumExplorerTransaction
}

export interface TransactionBase {
  hash: string
  account: {
    networkId: string
  }
}

export interface TransactionRequest extends TransactionBase {
  account: WalletAccount
  meta?: TransactionMeta
}

export interface Transaction extends TransactionRequest {
  status: Status
  failureReason?: { code: string; error_message: string }
  timestamp: number
}

export const compareTransactions = (
  a: TransactionBase,
  b: TransactionBase,
): boolean => a.hash === b.hash && a.account.networkId === a.account.networkId

export function entryPointToHumanReadable(entryPoint: string): string {
  try {
    return upperFirst(lowerCase(entryPoint))
  } catch {
    return entryPoint
  }
}

export const getInFlightTransactions = (
  transactions: Transaction[],
): Transaction[] =>
  transactions.filter(
    ({ status }) =>
      TRANSACTION_STATUSES_TO_TRACK.includes(status)
  )

export function nameTransaction(calls: Call | Call[]) {
  const callsArray = Array.isArray(calls) ? calls : [calls]
  const entrypointNames = callsArray.map((call) => call.entrypoint)
  return transactionNamesToTitle(entrypointNames)
}

export function transactionNamesToTitle(
  names: string | string[],
): string | undefined {
  if (!Array.isArray(names)) {
    names = [names]
  }
  const entrypointNames = names.map((name) => lowerCase(name))
  const lastName = entrypointNames.pop()
  const title = entrypointNames.length
    ? `${entrypointNames.join(", ")} and ${lastName}`
    : lastName
  return upperFirst(title)
}

// ===== ALPH ======
export async function getTransactionsPerAccount(
  accountsToPopulate: WalletAccount[],
  metadataTransactions: Transaction[],
): Promise<Map<WalletAccount, Transaction[]>> {
  const getTransactions = buildGetTransactionsFn(metadataTransactions)
  const transactionsPerAccount = new Map<WalletAccount, Transaction[]>()
  await Promise.all(
    accountsToPopulate.map(async (account) => {
      const transactions = await getTransactions(account)
      transactionsPerAccount.set(account, transactions)
    }),
  )

  return transactionsPerAccount
}

// The number of transactions fetched has the following constraints:
// 1) At most 50 transactions (3.1kb per tx, 50 txs = 155kb per account),
//    max `chrome.storage.local` quota per extension is 5mb
// 2) At least total number of transactions from the last two days
function buildGetTransactionsFn(metadataTransactions: Transaction[]) {
  return async (account: WalletAccount) => {
    const currentDate = new Date()
    const network = await getNetwork(account.networkId)
    const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
    const limit = 50

    let page = 1
    let continueFetching = true
    const result: Transaction[] = []
    while (continueFetching) {
      const transactions: AlephiumTransaction[] = await explorerProvider.addresses.getAddressesAddressTransactions(account.address, { page, limit })
      const convertedTxs = transactions.map((transaction) =>
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
      result.push(...convertedTxs)

      if (transactions.length < limit) {
        continueFetching = false
      } else {
        const lastTxDate = new Date(transactions[transactions.length - 1].timestamp)
        const txCreatedSinceInMinutes = (currentDate.valueOf() - lastTxDate.valueOf()) / 1000 / 60
        const txCreatedLessThan2Days = txCreatedSinceInMinutes < 60 * 24 * 2

        if (!txCreatedLessThan2Days) {
          continueFetching = false
        }
      }

      page += 1
    }

    console.debug(`fetched tx for account ${account.address} in network ${account.networkId}`, result)
    return result
  }
}
