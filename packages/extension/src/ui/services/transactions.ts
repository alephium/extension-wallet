import { convertAlphToSet } from '@alephium/sdk'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { Token } from '@alephium/web3'

import { TransactionPayload } from '../../shared/transactions'
import { TransactionWithAddress } from '../../shared/transactions/transactions'
import { executeAlephiumTransaction } from './backgroundTransactions'
import { formatDate } from './dates'

export const sendAlephiumTransferTransaction = async (fromAddr: string, toAddr: string, amountInAlph: string, tokens: Token[]) => {
  const amount = convertAlphToSet(amountInAlph)
  const payload: TransactionPayload = {
    type: 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX',
    params: {
      signerAddress: fromAddr,
      destinations: [
        {
          address: toAddr,
          attoAlphAmount: amount,
          tokens
        }
      ]
    }
  }

  return await executeAlephiumTransaction(payload)
}

export const orderTransactionsPerDay = <T extends Transaction | TransactionWithAddress>(transactions: T[]) => {
  const orderedTXs: Record<string, T[]> = {}

  for (const tx of transactions) {
    const date = new Date(tx.timestamp)
    const dateLabel = formatDate(date)
    orderedTXs[dateLabel] ||= []
    orderedTXs[dateLabel].push(tx)
  }

  return orderedTXs
}
