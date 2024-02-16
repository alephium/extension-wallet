import { ReviewTransactionResult } from "../../shared/actionQueue/types"
import { addTransaction } from "../../shared/transactions/store"
import { BackgroundService } from "../background"

export const executeTransactionAction = async (
  transaction: ReviewTransactionResult,
  signatureOpt: string | undefined,
  { wallet }: BackgroundService,
  networkId: string,
): Promise<{ signature: string }> => {
  const account = await wallet.getAccount({
    address: transaction.params.signerAddress,
    networkId: networkId,
  })

  let finalSignature = signatureOpt ?? "Getting signature"
  if (signatureOpt === undefined) {
    finalSignature = (
      await wallet.signAndSubmitUnsignedTx(account, {
        signerAddress: account.address,
        unsignedTx: transaction.result.unsignedTx,
      })
    ).signature
  } else {
    await wallet.submitSignedTx(
      account,
      transaction.result.unsignedTx,
      signatureOpt,
    )
  }

  if (account !== undefined) {
    addTransaction({
      account: account,
      hash: transaction.result.txId,
      meta: {
        request: transaction,
      },
    })
  }

  return { signature: finalSignature }
}
