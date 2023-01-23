import { SignTransferTxParams } from "@alephium/web3"

import { executeTransaction } from "./backgroundTransactions"

export const sendTransaction = (data: SignTransferTxParams) => {
  executeTransaction({
    type: "TRANSFER",
    params: data,
    salt: Math.random().toString()
  })
}
