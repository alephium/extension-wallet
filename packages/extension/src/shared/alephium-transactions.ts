import { MIN_UTXO_SET_AMOUNT, isConsolidationTx } from '@alephium/sdk'
import { Input, Output, Transaction, UnconfirmedTransaction } from '@alephium/sdk/api/explorer'
import { WalletAccount } from "./wallet.model"


export type PendingTx = {
  txId: string
  fromAddress: string
  toAddress: string
  timestamp: number
  type: TransactionType
  network: string
  amount?: bigint
  lockTime?: Date
  status: 'pending'
}

export type AddressHash = string

export type TransactionWithAddress = Transaction & { addressHash: AddressHash }

export type TransactionVariant = Transaction | PendingTx
type IsTransactionVariant<T extends TransactionVariant> = T extends Transaction
  ? Transaction
  : T extends PendingTx
  ? PendingTx
  : never
export type BelongingToAddress<T extends TransactionVariant> = { data: IsTransactionVariant<T>; account: WalletAccount }

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export type TransactionDirection = 'out' | 'in'
export type TransactionInfoType = TransactionDirection | 'move' | 'pending'
export type TransactionType = 'consolidation' | 'transfer' | 'sweep'
export type TransactionStatus = 'pending' | 'confirmed'

export const isPendingTx = (tx: TransactionVariant): tx is PendingTx => (tx as PendingTx).status === 'pending'

type HasTimestamp = { timestamp: number }

export function sortTransactions(a: HasTimestamp, b: HasTimestamp): number {
  const delta = b.timestamp - a.timestamp

  // Sent and received in the same block, but will not be in the right order when displaying
  if (delta === 0) {
    return -1
  }

  return delta
}

export const hasOnlyInputsWith = (inputs: Input[], addresses: string[]): boolean =>
  inputs.every((i) => i?.address && addresses.indexOf(i.address) >= 0)

export const hasOnlyOutputsWith = (outputs: Output[], addresses: string[]): boolean =>
  outputs.every((o) => o?.address && addresses.indexOf(o.address) >= 0)

export const calculateUnconfirmedTxSentAmount = (tx: UnconfirmedTransaction, address: AddressHash): bigint => {
  if (!tx.inputs || !tx.outputs) {
    throw 'Missing transaction details'
  }

  const totalOutputAmount = tx.outputs.reduce((acc, output) => acc + BigInt(output.attoAlphAmount), BigInt(0))

  if (isConsolidationTx(tx)) {
    return totalOutputAmount
  }

  const totalOutputAmountOfAddress = tx.outputs.reduce(
    (acc, output) => (output.address === address ? acc + BigInt(output.attoAlphAmount) : acc),
    BigInt(0)
  )

  return totalOutputAmount - totalOutputAmountOfAddress
}

// It can currently only take care of sending transactions.
// See: https://github.com/alephium/explorer-backend/issues/360
export const convertUnconfirmedTxToPendingTx = (
  tx: UnconfirmedTransaction,
  fromAddress: AddressHash,
  network: string
): PendingTx => {
  if (!tx.outputs) {
    throw 'Missing transaction details'
  }

  const amount = calculateUnconfirmedTxSentAmount(tx, fromAddress)
  const toAddress = tx.outputs[0].address

  if (!fromAddress) {
    throw new Error('fromAddress is not defined')
  }
  if (!toAddress) {
    throw new Error('toAddress is not defined')
  }

  return {
    txId: tx.hash,
    fromAddress,
    toAddress,
    // No other reasonable way to know when it was sent, so using the lastSeen is the best approximation
    timestamp: tx.lastSeen,
    type: 'transfer',
    // SUPER important that this is the same as the current network. Lots of debug time used tracking this down.
    network,
    amount,
    status: 'pending'
  }
}
