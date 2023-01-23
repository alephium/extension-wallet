import { Call } from "starknet"
import { TransactionParams } from "../../../../shared/actionQueue/types"

import { isErc20TransferCall } from "../../../../shared/call"
import {
  ApiTransactionReviewResponse,
  getTransactionReviewHasSwap,
} from "../../../../shared/transactionReview.service"

export const titleForTransactions = (
  transaction: TransactionParams
) => {
  switch (transaction.type) {
    case 'TRANSFER':
      return "Review transfer"
    case 'DEPLOY_CONTRACT':
      return "Review contract deploy"
    case 'EXECUTE_SCRIPT':
      return 'Review dapp transaction'
    case 'UNSIGNED_TX':
      return 'Review transaction'
  }
}
