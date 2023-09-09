import { transactionTracker } from "./tracking"

const DEFAULT_INTERVAL = 60 * 1000
const PENDIN_TXS_INTERVAL = 4 * 1000

interface TransactionWatcher {
  start: () => void
  refresh: () => void
}

function newTransactionWatcher(): TransactionWatcher {
  let taskId: ReturnType<typeof setTimeout> | undefined = undefined

  const updateTxStatus = async () => {
    console.info("~> fetching transaction updates")
    const hasInFlightTransactions = await transactionTracker.update()
    if (hasInFlightTransactions) {
      taskId = setTimeout(updateTxStatus, PENDIN_TXS_INTERVAL)
    } else {
      taskId = setTimeout(updateTxStatus, DEFAULT_INTERVAL)
    }
  }

  const start = () => {
    taskId = setTimeout(updateTxStatus, DEFAULT_INTERVAL)
  }

  const refresh = () => {
    if (taskId !== undefined) {
      clearTimeout(taskId)
    }
    taskId = setTimeout(updateTxStatus, PENDIN_TXS_INTERVAL)
  }

  return { start, refresh }
}

export const transactionWatcher = newTransactionWatcher()
