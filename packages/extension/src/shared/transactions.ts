import {
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferTxParams,
  SignTransferTxResult,
} from "@alephium/web3"

export interface TransactionMeta {
  title?: string
  subTitle?: string
}

export type TransactionPayload =
  | {
      type: "ALPH_SIGN_TRANSFER_TX"
      params: SignTransferTxParams
    }
  | {
      type: "ALPH_SIGN_CONTRACT_CREATION_TX"
      params: SignDeployContractTxParams
    }
  | {
      type: "ALPH_SIGN_SCRIPT_TX"
      params: SignExecuteScriptTxParams
    }

export type TransactionResult =
  | {
      type: "ALPH_SIGN_TRANSFER_TX_RES"
      result: SignTransferTxResult
    }
  | {
      type: "ALPH_SIGN_CONTRACT_CREATION_TX_RES"
      result: SignDeployContractTxResult
    }
  | {
      type: "ALPH_SIGN_SCRIPT_TX_RES"
      result: SignExecuteScriptTxResult
    }
