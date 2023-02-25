import { CellStack, H4, SpacerCell } from "@argent/ui"
import { Center, Skeleton } from "@chakra-ui/react"
import { FC, Suspense, useCallback, useMemo } from "react"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { formatDate } from "../../services/dates"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useTokens, useTokensWithBalance } from "../accountTokens/tokens.state"
import { AccountActivity } from "./AccountActivity"
import { PendingTransactionsContainer } from "./PendingTransactions"
import { isVoyagerTransaction } from "./transform/is"
import { ActivityTransaction } from "./useActivity"

export interface AccountActivityContainerProps {
  account: Account
}

export const AccountActivityContainer: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  return (
    <CellStack>
      <Center>
        <H4>Activity</H4>
      </Center>
      <PendingTransactionsContainer account={account} />
      <ErrorBoundary
        fallback={
          <ErrorBoundaryFallback title="Seems like Explorer API is down..." />
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

export const AccountActivityLoader: FC<AccountActivityContainerProps> = ({
  account,
}) => {
  const { transactions } = useAccountTransactions(account)
  const tokens = useTokens(account)
  const confirmedTransactions = useMemo(() => {
    // RECEIVED transactions are already shown as pending
    return transactions.filter(
      (transaction) =>
        transaction.status !== "RECEIVED",
    )
  }, [transactions])

  console.log("confirmedTransactions", confirmedTransactions)
  const activity: Record<
    string,
    Array<ActivityTransaction | IExplorerTransaction>
  > = {}
  for (const transaction of confirmedTransactions) {
    const date = formatDate(new Date(transaction.timestamp))
    const dateLabel = date.toString()
    activity[dateLabel] ||= []
    if (isVoyagerTransaction(transaction)) {
      const { hash, meta, inputs, outputs, status } = transaction
      const isRejected = status === "REJECTED"
      const activityTransaction: ActivityTransaction = {
        hash,
        date,
        inputs,
        outputs,
        meta,
        isRejected,
      }
      activity[dateLabel].push(activityTransaction)
    } else {
      activity[dateLabel].push(transaction)
    }
  }

  return (
    // Design 1
    /*
    <AccountTransactionList account={account} />
    */

    // Design 2
    <AccountActivity
      activity={activity}
      loadMoreHashes={[]}
      account={account}
      tokensByNetwork={tokens}
      nftContractAddresses={[]}
      onLoadMore={() => { return }}
    />
  )
}
