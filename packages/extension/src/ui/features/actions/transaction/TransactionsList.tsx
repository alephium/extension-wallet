import { isArray } from "lodash-es"
import { FC, useMemo } from "react"
import { Call } from "starknet"
import { ReviewTransactionResult, TransactionParams } from "../../../../shared/actionQueue/types"

import { Token } from "../../../../shared/token/type"
import {
  ApiTransactionReviewResponse,
  getDisplayWarnAndReasonForTransactionReview,
  getTransactionReviewHasSwap,
} from "../../../../shared/transactionReview.service"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"
import { TransactionsListSwap } from "./TransactionsListSwap"

export interface ITransactionsList {
  networkId: string
  transactionReview: ReviewTransactionResult
}

/** Renders one or more transactions with review if available */

export const TransactionsList: FC<ITransactionsList> = ({
  transactionReview
}) => {
  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)
  return (
    <>
      {warn && (
        <TransactionBanner
          variant={undefined}
          icon={WarningIcon}
          message={reason}
        />
      )} : (
        <TransactionActions transaction={transactionReview} />
      )
    </>
  )
}
