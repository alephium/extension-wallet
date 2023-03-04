import { FC } from "react"
import { ReviewTransactionResult } from "../../../../shared/actionQueue/types"

import {
  getDisplayWarnAndReasonForTransactionReview,
} from "../../../../shared/transactionReview.service"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"

export interface ITransactionsList {
  networkId: string
  transactionReview: ReviewTransactionResult
}

/** Renders one or more transactions with review if available */

export const TransactionsList: FC<ITransactionsList> = ({
  networkId,
  transactionReview
}) => {
  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)
  return (
    <>
      {warn ? (
        <TransactionBanner
          variant={undefined}
          icon={WarningIcon}
          message={reason}
        />
      ) : (
        <TransactionActions networkId={networkId} transaction={transactionReview} />
      )}
    </>
  )
}
