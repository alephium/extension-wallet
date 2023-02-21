import { HeaderCell } from "@argent/ui"
import { FC, Fragment } from "react"
import { useNavigate } from "react-router-dom"

import { IExplorerTransaction } from "../../../shared/explorer/type"
import { Token } from "../../../shared/token/type"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { ReviewedTransactionListItem, TransactionListItem } from "./TransactionListItem"
import { transformExplorerTransaction, transformTransaction } from "./transform"
import { isActivityTransaction, isExplorerTransaction } from "./transform/is"
import { LoadMoreTrigger } from "./ui/LoadMoreTrigger"
import { ActivityTransaction } from "./useActivity"

interface AccountActivityProps {
  account: Account
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
  activity: Record<string, Array<ActivityTransaction | IExplorerTransaction>>
  loadMoreHashes: string[]
  onLoadMore: () => void
}

export const AccountActivity: FC<AccountActivityProps> = ({
  account,
  tokensByNetwork,
  nftContractAddresses,
  activity,
  loadMoreHashes = [],
  onLoadMore,
}) => {
  const navigate = useNavigate()
  return (
    <>
      {Object.entries(activity).map(([dateLabel, transactions]) => (
        <Fragment key={dateLabel}>
          <HeaderCell>{dateLabel}</HeaderCell>
          {transactions.map((transaction) => {
            if (isActivityTransaction(transaction)) {
              const { hash, isRejected } = transaction
              const transactionTransformed = transaction.meta?.reviewTxResult

              if (transactionTransformed) {
                return (
                  <ReviewedTransactionListItem
                    key={hash}
                    transactionTransformed={transactionTransformed}
                    networkId={account.networkId}
                    onClick={() => navigate(routes.transactionDetail(hash))}
                  >
                    {isRejected ? (
                      <div style={{ display: "flex" }}>
                        <TransactionStatusIndicator color={"red"} />
                      </div>
                    ) : null}
                  </ReviewedTransactionListItem>
                )
              }
              return null
            } else if (isExplorerTransaction(transaction)) {
              const explorerTransactionTransformed =
                transaction &&
                transformExplorerTransaction({
                  explorerTransaction: transaction,
                  accountAddress: account.address,
                  tokensByNetwork,
                  nftContractAddresses,
                })
              if (explorerTransactionTransformed) {
                const { transactionHash } = transaction
                const loadMore = loadMoreHashes.includes(transactionHash)
                return (
                  <Fragment key={transactionHash}>
                    <TransactionListItem
                      transactionTransformed={explorerTransactionTransformed}
                      networkId={account.networkId}
                      onClick={() =>
                        navigate(routes.transactionDetail(transactionHash))
                      }
                    />
                    {loadMore && (
                      <LoadMoreTrigger onLoadMore={onLoadMore} mt={-2} />
                    )}
                  </Fragment>
                )
              }
            } else {
              return null
            }
          })}
        </Fragment>
      ))}
    </>
  )
}
