import { transactionTracker } from "./tracking"

const MAX_RETRIES = 75
const PENDIN_TXS_INTERVAL = 4 * 1000

interface TransactionWatcher {
  refresh: () => void
}

function newTransactionWatcher(): TransactionWatcher {
  let taskId: ReturnType<typeof setTimeout> | undefined = undefined

  const updateTxStatus = async (runs: number) => {
    const hasInFlightTransactions = await transactionTracker.update()
    if (hasInFlightTransactions && (runs < MAX_RETRIES)) {
      taskId = setTimeout(() => updateTxStatus(runs + 1), PENDIN_TXS_INTERVAL)
    }
  }

  const refresh = () => {
    if (taskId !== undefined) {
      clearTimeout(taskId)
    }
    taskId = setTimeout(() => updateTxStatus(0), PENDIN_TXS_INTERVAL)
  }

  return { refresh }
}

export const transactionWatcher = newTransactionWatcher()
