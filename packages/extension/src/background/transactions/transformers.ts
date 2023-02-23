import { Transaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { explorer } from '@alephium/web3'

export const mapAlephiumTransactionToTransaction = (
  transaction: explorer.Transaction,
  account: WalletAccount,
  meta?: { title?: string; subTitle?: string },
): Transaction => ({
  hash: transaction.hash,
  inputs: transaction.inputs,
  outputs: transaction.outputs,
  account,
  meta,
  status: "ACCEPTED_ON_CHAIN",
  timestamp: transaction.timestamp,
})
