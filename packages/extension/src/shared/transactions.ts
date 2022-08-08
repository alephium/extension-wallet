import { SignTransferTxParams } from "@alephium/web3"

export interface TransactionMeta {
  title?: string
  subTitle?: string
}

export type TransactionPayload = {
  type: "ALPH_SIGN_TRANSFER_TX"
  params: SignTransferTxParams
}
