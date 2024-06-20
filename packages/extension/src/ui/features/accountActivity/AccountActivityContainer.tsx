import { CellStack, H4, SpacerCell } from "@argent/ui"
import { Center, Skeleton } from "@chakra-ui/react"
import { FC, Suspense, useCallback, useMemo } from "react"
import { AlephiumExplorerTransaction } from "../../../shared/explorer/type"
import { Transaction } from "../../../shared/transactions"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { formatDate } from "../../services/dates"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useFungibleTokensWithBalance } from "../accountTokens/tokens.state"
import { useNetwork } from "../networks/useNetworks"
import { AccountActivity } from "./AccountActivity"
import { PendingTransactionsContainer } from "./PendingTransactions"
import { isVoyagerTransaction } from "./transform/is"
import { ActivityTransaction } from "./useActivity"
import { useAlephiumExplorerAccountTransactionsInfinite } from "./useArgentExplorer"
import { useTranslation } from "react-i18next"

export interface AccountActivityContainerProps {
  account: Account
}

export const AccountActivityContainer: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  const { t } = useTranslation()
  return (
    <CellStack>
      <Center>
        <H4>{t("Activity")}</H4>
      </Center>
      <PendingTransactionsContainer account={account} />
      <ErrorBoundary
        fallback={
          <ErrorBoundaryFallback title={`${t('Seems like Explorer API is down')}...`} />
        }
      >
        <Suspense
          fallback={
            <>
              <SpacerCell />
              <Skeleton height="16" rounded={"xl"} />
              <Skeleton height="16" rounded={"xl"} />
              <Skeleton height="16" rounded={"xl"} />
            </>
          }
        >
          <AccountActivityLoader account={account} />
        </Suspense>
      </ErrorBoundary>
    </CellStack>
  )
}

const PAGE_SIZE = 10

export const AccountActivityLoader: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  const { tokenDetails: tokens } = useFungibleTokensWithBalance(account)

  const { explorerApiUrl } = useNetwork(account.networkId)
  const { data, setSize } = useAlephiumExplorerAccountTransactionsInfinite(
    {
      accountAddress: account.address,
      explorerApiUrl: explorerApiUrl,
      pageSize: PAGE_SIZE,
    },
    {
      suspense: true,
    },
  )

  const explorerTransactions = useMemo(() => {
    if (!data) {
      return
    }
    return data.flat()
  }, [data])

  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE)

  const { transactions } = useAccountTransactions(account)
  const voyagerTransactions = useMemo(() => {
    // RECEIVED transactions are already shown as pending
    return transactions.filter(
      (transaction) =>
        transaction.status !== "RECEIVED",
    )
  }, [transactions])

  const mergedTransactions = useMemo(() => {
    if (!explorerTransactions) {
      return {
        transactions: voyagerTransactions,
      }
    }
    const matchedHashes: string[] = []

    transactions.map((transaction) => {
      const explorerTransaction = explorerTransactions.find(
        (explorerTransaction) =>
          explorerTransaction.hash === transaction.hash,
      )

      if (explorerTransaction) {
        matchedHashes.push(transaction.hash)
      }
    })

    const unmatchedExplorerTransactions = explorerTransactions.filter(
      (explorerTransaction) =>
        !matchedHashes.includes(explorerTransaction.hash),
    )

    const mergedTransactions: Array<Transaction | AlephiumExplorerTransaction> = [...voyagerTransactions]

    for (const transaction of unmatchedExplorerTransactions) {
      mergedTransactions.push(transaction)
    }

    const sortedTransactions = mergedTransactions.sort(
      (a, b) => b.timestamp - a.timestamp,
    )

    return {
      transactions: sortedTransactions,
    }
  }, [explorerTransactions, voyagerTransactions, transactions])

  const { activity, loadMoreHashes } = useMemo(() => {
    const activity: Record<
      string,
      Array<ActivityTransaction | AlephiumExplorerTransaction>
    > = {}
    let lastExplorerTransactionHash
    for (const transaction of mergedTransactions.transactions) {
      const date = formatDate(new Date(transaction.timestamp))
      const dateLabel = date.toString()
      activity[dateLabel] ||= []
      if (isVoyagerTransaction(transaction)) {
        const { hash, meta, status } = transaction
        const isRejected = status === "REJECTED"
        const activityTransaction: ActivityTransaction = {
          hash,
          date,
          meta,
          isRejected,
        }
        activity[dateLabel].push(activityTransaction)
      } else {
        activity[dateLabel].push(transaction)
        lastExplorerTransactionHash = transaction.hash
      }
    }

    const loadMoreHashes = []

    if (lastExplorerTransactionHash) {
      loadMoreHashes.push(lastExplorerTransactionHash)
    }

    return { activity, loadMoreHashes }
  }, [mergedTransactions])


  const onLoadMore = useCallback(() => {
    if (!isReachingEnd) {
      setSize((size) => size + 1)
    }
  }, [isReachingEnd, setSize])

  return (
    <AccountActivity
      activity={activity}
      loadMoreHashes={loadMoreHashes}
      account={account}
      tokensByNetwork={tokens}
      nftContractAddresses={[]}
      onLoadMore={onLoadMore}
    />
  )
}
