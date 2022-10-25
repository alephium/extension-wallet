import {
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignMessageParams,
  SignTransferTxParams,
  SignUnsignedTxParams
} from '@alephium/web3'
import { Transaction as AlephiumTransaction } from '@alephium/web3/dist/src/api/api-explorer'

import { TransactionResult } from '../transactions'

export type TransactionPayload =
  | {
      type: 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX'
      params: SignTransferTxParams
    }
  | {
      type: 'ALPH_SIGN_AND_SUBMIT_DEPLOY_CONTRACT_TX'
      params: SignDeployContractTxParams
    }
  | {
      type: 'ALPH_SIGN_AND_SUBMIT_EXECUTE_SCRIPT_TX'
      params: SignExecuteScriptTxParams
    }
  | {
      type: 'ALPH_SIGN_UNSIGNED_TX'
      params: SignUnsignedTxParams
    }
  | {
      type: 'ALPH_SIGN_AND_SUBMIT_UNSIGNED_TX'
      params: SignUnsignedTxParams
    }
  | {
      type: 'ALPH_SIGN_MESSAGE'
      params: SignMessageParams
    }

export type TransactionMessage =
  | { type: 'GET_TRANSACTIONS'; data: { address: string } }
  | { type: 'GET_TRANSACTIONS_RES'; data: AlephiumTransaction[] }
  | { type: 'GET_ADDRESS_TOKEN_TRANSACTIONS'; data: { address: string; tokenId: string } }
  | { type: 'GET_ADDRESS_TOKEN_TRANSACTIONS_RES'; data: AlephiumTransaction[] }
  | {
      type: 'EXECUTE_TRANSACTION'
      data: TransactionPayload
    }
  | { type: 'EXECUTE_TRANSACTION_RES'; data: { actionHash: string } }
  | { type: 'GET_TRANSACTION_REJ' }
  | {
      type: 'TRANSACTION_SUBMITTED'
      data: { txResult: TransactionResult; actionHash: string }
    }
  | {
      type: 'TRANSACTION_REJECTED'
      data: { tag: 'Rejected'; actionHash: string }
    }
  | {
      type: 'TRANSACTION_FAILED'
      data: { tag: 'Failure'; actionHash: string; error?: string }
    }
  | {
      type: 'TRANSACTION_SUCCESS'
      data: { tag: 'Success'; txResult: TransactionResult; actionHash: string }
    }
