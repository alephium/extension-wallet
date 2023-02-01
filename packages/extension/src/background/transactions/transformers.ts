import { Transaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { Transaction as AlephiumTransaction } from '@alephium/web3/dist/src/api/api-explorer'

export const mapAlephiumTransactionToTransaction = (
  transaction: AlephiumTransaction,
  account: WalletAccount,
  meta?: { title?: string; subTitle?: string },
): Transaction => ({
  hash: transaction.hash,
  account,
  meta,
  status: "ACCEPTED_ON_L1",
  timestamp: transaction.timestamp,
})
