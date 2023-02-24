import { Transaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { explorer } from '@alephium/web3'
import { ReviewTransactionResult } from "../../shared/actionQueue/types";

export const mapAlephiumTransactionToTransaction = (
  transaction: explorer.Transaction,
  account: WalletAccount,
  meta?: { title?: string; subTitle?: string; request?: ReviewTransactionResult },
): Transaction => ({
  hash: transaction.hash,
  account,
  meta: {
    ...meta,
    explorer: (meta === undefined || meta.request === undefined) ? transaction : undefined
  },
  status: "ACCEPTED_ON_CHAIN",
  timestamp: transaction.timestamp,
})
