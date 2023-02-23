import { HeaderCell } from "@argent/ui"
import { FC, Fragment } from "react"
import { useNavigate } from "react-router-dom"

import { AlephiumExplorerTransaction } from "../../../shared/explorer/type"
import { Token } from "../../../shared/token/type"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { ReviewedTransactionListItem } from "./TransactionListItem"
import { transformAlephiumExplorerTransaction } from "./transform/explorerTransaction/transformExplorerTransaction"
import { isActivityTransaction, isExplorerTransaction, isVoyagerTransaction } from "./transform/is"
import { LoadMoreTrigger } from "./ui/LoadMoreTrigger"
import { ActivityTransaction } from "./useActivity"

interface AccountActivityProps {
  account: Account
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
  activity: Record<string, Array<ActivityTransaction | AlephiumExplorerTransaction>>
  loadMoreHashes: string[]
  onLoadMore: () => void
}

export const AccountActivity: FC<AccountActivityProps> = ({
  account,
  activity,
  loadMoreHashes = [],
  onLoadMore,
}) => {
  const navigate = useNavigate()

  console.log('===== AccountActivity', activity, loadMoreHashes, account)
  return (
    <>
      {Object.entries(activity).map(([dateLabel, transactions]) => (
        <Fragment key={dateLabel}>
          <HeaderCell>{dateLabel}</HeaderCell>
          {transactions.map((transaction) => {
            console.log('===== test', isActivityTransaction(transaction), isVoyagerTransaction(transaction), isExplorerTransaction(transaction))
            if (isActivityTransaction(transaction)) {
              const { hash, isRejected } = transaction
              const transactionTransformed = transaction.meta?.transaction

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
                transformAlephiumExplorerTransaction({
                  explorerTransaction: transaction,
                  accountAddress: account.address,
                })
              if (explorerTransactionTransformed) {
                const { hash } = transaction
                const loadMore = loadMoreHashes.includes(hash)
                return (
                  <Fragment key={hash}>
                    <ReviewedTransactionListItem
                      transactionTransformed={explorerTransactionTransformed}
                      networkId={account.networkId}
                      onClick={() =>
                        navigate(routes.transactionDetail(hash))
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
