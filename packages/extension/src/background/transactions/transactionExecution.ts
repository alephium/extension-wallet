import { AlephiumTransactionPayload } from "../../shared/actionQueue"
import { BackgroundService } from "../background"

export const executeAlephiumTransaction = async (
  payload: AlephiumTransactionPayload,
  { wallet }: BackgroundService,
) => {
  switch (payload.type) {
    case "ALPH_SIGN_TRANSFER_TX": {
      const signer = await wallet.getAlephiumPrivateKeySigner()
      if (signer) {
        const signResult = await signer.signTransferTx(payload.params)
        const submissionResult = await signer.submitTransaction(
          signResult.unsignedTx,
          signResult.txId,
          signer.address,
        )
        return submissionResult
      } else {
        throw Error("Can not find signer")
      }
    }
  }
}
