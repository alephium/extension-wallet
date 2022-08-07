import { convertAlphToSet } from "@alephium/sdk"

import { AlephiumTransactionPayload } from "../../shared/actionQueue"
import { executeAlephiumTransaction } from "./backgroundTransactions"

export const sendAlephiumTransferTransaction = (
  fromAddr: string,
  toAddr: string,
  amountInAlph: string,
) => {
  const amount = convertAlphToSet(amountInAlph)
  const payload: AlephiumTransactionPayload = {
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

  executeAlephiumTransaction(payload)
}
