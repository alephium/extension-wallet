import { Transaction as AlephiumTransaction } from "@alephium/sdk/api/explorer"
import { SignTransferTxParams } from "@alephium/web3"

export interface EstimateFeeResponse {
  amount: string
  unit: string
  suggestedMaxFee: string
}

export type TransactionPayload = {
  type: "ALPH_SIGN_TRANSFER_TX"
  params: SignTransferTxParams
}

export type TransactionMessage =
  | { type: "GET_TRANSACTIONS"; data: { address: string } }
  | { type: "GET_TRANSACTIONS_RES"; data: AlephiumTransaction[] }
  | {
      type: "EXECUTE_TRANSACTION"
      data: TransactionPayload
    }
  | { type: "EXECUTE_TRANSACTION_RES"; data: { actionHash: string } }
  | { type: "GET_TRANSACTION_REJ" }
  | {
      type: "TRANSACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "TRANSACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | {
      type: "UPDATE_TRANSACTION_FEE_RES"
      data: { actionHash: string }
    }
