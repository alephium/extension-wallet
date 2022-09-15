import { Transaction } from '@alephium/sdk/api/explorer'

import { Address } from '../../../shared/Address'
import { TransactionMeta } from '../../../shared/transactions'
import { getAlephiumTransactions } from '../../services/backgroundTransactions'
import { formatDate } from '../../services/dates'

export interface ActivityTransaction {
  hash: string
  date: Date
  meta?: TransactionMeta
  isRejected?: boolean
}

export type DailyActivity = Record<string, ActivityTransaction[]>

export async function getAlephiumActivity(address: Address): Promise<DailyActivity> {
  let transactions: Transaction[] = []

  try {
    transactions = await getAlephiumTransactions(address.hash)
  } catch (e) {
    console.error(e)
  }

  const activity: DailyActivity = {}
  for (const { hash, timestamp } of transactions) {
    // RECEIVED transactions are already shown as pending
    const date = new Date(timestamp)
    const dateLabel = formatDate(date)
    activity[dateLabel] ||= []
    activity[dateLabel].push({ hash, date })
  }
  return activity
}
