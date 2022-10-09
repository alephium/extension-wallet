import {
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignHexStringParams,
  SignHexStringResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
  SubmissionResult
} from '@alephium/web3'

export interface TransactionMeta {
  title?: string
  subTitle?: string
}

export type TransactionPayload =
  | {
    type: 'ALPH_SIGN_TRANSFER_TX'
    params: SignTransferTxParams
  }
  | {
    type: 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX'
    params: SignTransferTxParams
  }
  | {
    type: 'ALPH_SIGN_CONTRACT_CREATION_TX'
    params: SignDeployContractTxParams
  }
  | {
    type: 'ALPH_SIGN_AND_SUBMIT_CONTRACT_CREATION_TX'
    params: SignDeployContractTxParams
  }
  | {
    type: 'ALPH_SIGN_SCRIPT_TX'
    params: SignExecuteScriptTxParams
  }
  | {
    type: 'ALPH_SIGN_AND_SUBMIT_SCRIPT_TX'
    params: SignExecuteScriptTxParams
  }
  | {
    type: 'ALPH_SIGN_UNSIGNED_TX'
    params: SignUnsignedTxParams
  }
  | {
    type: 'ALPH_SIGN_HEX_STRING'
    params: SignHexStringParams
  }
  | {
    type: 'ALPH_SIGN_MESSAGE'
    params: SignMessageParams
  }

export type TransactionResult =
  | {
    type: 'ALPH_SIGN_TRANSFER_TX_RES'
    result: SignTransferTxResult
  }
  | {
    type: 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX_RES'
    result: SubmissionResult
  }
  | {
    type: 'ALPH_SIGN_CONTRACT_CREATION_TX_RES'
    result: SignDeployContractTxResult
  }
  | {
    type: 'ALPH_SIGN_AND_SUBMIT_CONTRACT_CREATION_TX_RES'
    result: SubmissionResult
  }
  | {
    type: 'ALPH_SIGN_SCRIPT_TX_RES'
    result: SignExecuteScriptTxResult
  }
  | {
    type: 'ALPH_SIGN_AND_SUBMIT_SCRIPT_TX_RES'
    result: SubmissionResult
  }
  | {
    type: 'ALPH_SIGN_UNSIGNED_TX_RES'
    result: SignUnsignedTxResult
  }
  | {
    type: 'ALPH_SIGN_HEX_STRING_RES'
    result: SignHexStringResult
  }
  | {
    type: 'ALPH_SIGN_MESSAGE_RES'
    result: SignMessageResult
  }
