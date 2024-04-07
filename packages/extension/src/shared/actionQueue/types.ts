import {
  KeyType,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
} from "@alephium/web3"

import { Token } from "../../shared/token/type"
import { TransactionMeta } from "../transactions"
import { BaseWalletAccount } from "../wallet.model"

export interface QueueItem {
  meta: {
    hash: string
    expires: number
  }
}

export type ExtQueueItem<T> = QueueItem & T

interface OptionalBuiltTransaction {
  networkId: string
  unsignedTx?: string
  txId?: string
  host?: string
}
export type TransactionPayload<T> = T & OptionalBuiltTransaction

export type TransactionParams = (
  | {
      type: "TRANSFER"
      params: TransactionPayload<SignTransferTxParams>
    }
  | {
      type: "DEPLOY_CONTRACT"
      params: TransactionPayload<SignDeployContractTxParams>
    }
  | {
      type: "EXECUTE_SCRIPT"
      params: TransactionPayload<SignExecuteScriptTxParams>
    }
  | {
      type: "UNSIGNED_TX"
      params: TransactionPayload<SignUnsignedTxParams>
    }
) & {
  salt: string // to avoid hash collision for queue items
}

export type ReviewTransactionResult =
  | {
      type: "TRANSFER"
      params: TransactionPayload<SignTransferTxParams>
      result: Omit<SignTransferTxResult, "signature">
    }
  | {
      type: "DEPLOY_CONTRACT"
      params: TransactionPayload<SignDeployContractTxParams>
      result: Omit<SignDeployContractTxResult, "signature">
    }
  | {
      type: "EXECUTE_SCRIPT"
      params: TransactionPayload<SignExecuteScriptTxParams> & { host?: string }
      result: Omit<SignExecuteScriptTxResult, "signature">
    }
  | {
      type: "UNSIGNED_TX"
      params: TransactionPayload<SignUnsignedTxParams>
      result: Omit<SignUnsignedTxResult, "signature">
    }

export type TransactionResult =
  | {
      type: "TRANSFER"
      result: SignTransferTxResult
    }
  | {
      type: "DEPLOY_CONTRACT"
      result: SignDeployContractTxResult
    }
  | {
      type: "EXECUTE_SCRIPT"
      result: SignExecuteScriptTxResult
    }
  | {
      type: "UNSIGNED_TX"
      result: SignUnsignedTxResult
    }

export type ActionItem =
  | {
      type: "ALPH_CONNECT_DAPP"
      payload: {
        host: string
        networkId?: string
        group?: number
        keyType?: KeyType
      }
    }
  | {
      type: "ALPH_TRANSACTION"
      payload: TransactionParams
    }
  | {
      type: "ALPH_SIGN_MESSAGE"
      payload: SignMessageParams & { networkId?: string; host: string }
    }
  | {
      type: "ALPH_SIGN_UNSIGNED_TX"
      payload: SignUnsignedTxParams & { networkId?: string; host: string }
    }
  | {
      type: "ALPH_REQUEST_ADD_TOKEN"
      payload: Token
    }
  | {
      type: "ALPH_REQUEST_ADD_CUSTOM_NETWORK"
      payload: {
        id: string
        name: string
        nodeUrl: string
        explorerApiUrl: string
        explorerUrl?: string
      }
    }
  | {
      type: "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK"
      payload: {
        id: string
        name: string
        nodeUrl: string
        explorerApiUrl: string
        explorerUrl?: string
      }
    }

export type ExtensionActionItem = ExtQueueItem<ActionItem>
