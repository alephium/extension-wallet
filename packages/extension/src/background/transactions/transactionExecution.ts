import { ReviewTransactionResult } from "../../shared/actionQueue/types"
import { addTransaction } from "../../shared/transactions/store"
import { BackgroundService } from "../background"

export const executeTransactionAction = async (
  transaction: ReviewTransactionResult,
  { wallet }: BackgroundService,
  networkId: string,
): Promise<{ signature: string }> => {
  const account = await wallet.getAccount({
    address: transaction.params.signerAddress,
    networkId: networkId,
  })

  const { signature } = await wallet.signAndSubmitUnsignedTx(account, {
    signerAddress: account.address,
    unsignedTx: transaction.result.unsignedTx,
  })

  addTransaction({
    account: account,
    hash: transaction.result.txId,
    meta: {
      request: transaction,
    },
  })

  return { signature }
}

export const executeTransactionsAction = async (
  transactions: ReviewTransactionResult[],
  { wallet }: BackgroundService,
  networkId: string,
): Promise<{ signatures: string[] }> => {
  const signatures: string[] = []
  for (const transaction of transactions) {
    const account = await wallet.getAccount({
      address: transaction.params.signerAddress,
      networkId: networkId,
    })

    const { signature } = await wallet.signAndSubmitUnsignedTx(account, {
      signerAddress: account.address,
      unsignedTx: transaction.result.unsignedTx,
    })

    addTransaction({
      account: account,
      hash: transaction.result.txId,
      meta: {
        request: transaction,
      },
    })

    signatures.push(signature)
  }

  return { signatures }
}
