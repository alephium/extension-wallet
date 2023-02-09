import { handleDeclareContractTransaction } from "./declareContract"
import { handleDeployAccountTransaction } from "./deployAccount"
import { checkResetStoredNonce } from "./nonce"
import { notifyAboutCompletedTransactions } from "./notifications"
import { TransactionUpdateListener } from "./type"
import { handleUpgradeTransaction } from "./upgrade"

const addedHandlers: TransactionUpdateListener[] = [
  notifyAboutCompletedTransactions
]

export const runAddedHandlers: TransactionUpdateListener = async (
  updates,
) => {
  await Promise.allSettled(
    addedHandlers.map((handler) => handler(updates)),
  )
}

const changedStatusHandlers: TransactionUpdateListener[] = [
  notifyAboutCompletedTransactions,
]

export const runChangedStatusHandlers: TransactionUpdateListener = async (
  updates,
) => {
  await Promise.allSettled(
    changedStatusHandlers.map((handler) => handler(updates)),
  )
}
