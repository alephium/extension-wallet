import { SUCCESS_STATUSES } from "../../../shared/transactions"
import { decrementTransactionsBeforeReview } from "../../../shared/userReview"
import {
  addToAlreadyShown,
  hasShownNotification,
  sentTransactionNotification,
} from "../../notification"
import { TransactionUpdateListener } from "./type"

export const notifyAboutCompletedTransactions: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      const { hash, status, meta, account, timestamp } = transaction
      const ifWithinTenMins = new Date() < new Date(timestamp + 10 * 60 * 1000)

      // Two scenarios that we notify about the completed transactions
      // 1) When we noticed that the existing pending transactions are completed
      //    we periodically check that using the `core:transactionTracker:update` alarm
      // 2) When we load the entire history and realized that there are new
      //    completed transactions.
      //    we periodically check that using the `core:transactionTracker:history` alarm
      //
      // This simple design probably satisfies most of the user cases.
      if (
        ifWithinTenMins &&
        (SUCCESS_STATUSES.includes(status) || status === "REJECTED") &&
        !(await hasShownNotification(hash + status))
      ) {
        addToAlreadyShown(hash + status)

        if (!account.hidden) {
          await decrementTransactionsBeforeReview()
          // Make sure the id is different for mempol tx and onchain tx
          sentTransactionNotification(hash + (status === "ACCEPTED_ON_CHAIN" ? ' ' : ''), status, account.networkId, meta)
        }
      }
    }
  }
