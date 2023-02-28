import { SignTransferTxParams, SignUnsignedTxParams } from "@alephium/web3"
import { executeTransaction } from "./backgroundTransactions"

export const sendTransferTransaction = (data: SignTransferTxParams & { networkId: string, host?: string }) => {
  executeTransaction({
    type: "TRANSFER",
    params: data,
    salt: Math.random().toString()
  })
}

export const sendUnsignedTxTransaction = (data: SignUnsignedTxParams & { networkId: string, host?: string }) => {
  executeTransaction({
    type: "UNSIGNED_TX",
    params: data,
    salt: Math.random().toString()
  })
}
