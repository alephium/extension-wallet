import { convertAlphToSet } from "@alephium/sdk"

import { TransactionPayload } from "../../shared/transactions"
import { executeAlephiumTransaction } from "./backgroundTransactions"

export const sendAlephiumTransferTransaction = async (
  fromAddr: string,
  toAddr: string,
  amountInAlph: string,
) => {
  const amount = convertAlphToSet(amountInAlph)
  const payload: TransactionPayload = {
    type: "ALPH_SIGN_TRANSFER_TX",
    params: {
      signerAddress: fromAddr,
      destinations: [
        {
          address: toAddr,
          attoAlphAmount: amount.toString(),
        },
      ],
    },
  }

  return await executeAlephiumTransaction(payload)
}
