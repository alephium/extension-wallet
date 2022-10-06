import { SignDeployContractTxParams, SignExecuteScriptTxParams, SignTransferTxParams } from '@alephium/web3'
import { Transaction as AlephiumTransaction } from '@alephium/web3/dist/src/api/api-explorer'

import { TransactionResult } from '../transactions'

export type TransactionPayload =
  | {
      type: 'ALPH_SIGN_TRANSFER_TX'
      params: SignTransferTxParams
    }
  | {
      type: 'ALPH_SIGN_CONTRACT_CREATION_TX'
      params: SignDeployContractTxParams
    }
  | {
      type: 'ALPH_SIGN_SCRIPT_TX'
      params: SignExecuteScriptTxParams
    }

export type TransactionMessage =
  | { type: 'GET_TRANSACTIONS'; data: { address: string } }
  | { type: 'GET_TRANSACTIONS_RES'; data: AlephiumTransaction[] }
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
