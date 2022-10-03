import { convertAlphToSet } from '@alephium/sdk'
import { Transaction } from '@alephium/sdk/api/explorer'

import { TransactionPayload } from '../../shared/transactions'
import { executeAlephiumTransaction } from './backgroundTransactions'
import { formatDate } from './dates'

export const sendAlephiumTransferTransaction = async (fromAddr: string, toAddr: string, amountInAlph: string) => {
  const amount = convertAlphToSet(amountInAlph)
  const payload: TransactionPayload = {
    type: 'ALPH_SIGN_TRANSFER_TX',
    params: {
      signerAddress: fromAddr,
      destinations: [
        {
          address: toAddr,
          attoAlphAmount: amount.toString()
        }
      ]
    }
  }

  return await executeAlephiumTransaction(payload)
}

export const orderTransactionsPerDay = (transactions: Transaction[]) => {
  const orderedTXs: Record<string, Transaction[]> = {}

  for (const tx of transactions) {
    const date = new Date(tx.timestamp)
    const dateLabel = formatDate(date)
    orderedTXs[dateLabel] ||= []
    orderedTXs[dateLabel].push(tx)
  }

  return orderedTXs
}
