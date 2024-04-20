import type {
  Abi,
  Call,
  InvocationsDetails,
  UniversalDeployerContractPayload,
} from "starknet"

import { TransactionParams, TransactionResult } from "../actionQueue/types"
import { Transaction } from "../transactions"
import { DeclareContract } from "../udc/type"
import { BaseWalletAccount } from "../wallet.model"

export interface EstimateFeeResponse {
  amount: string
  suggestedMaxFee: string
  accountDeploymentFee?: string
  maxADFee?: string
}

export interface DeclareDeployEstimateFeeResponse
  extends Omit<
    EstimateFeeResponse,
    "suggestedMaxFee" | "accountDeploymentFee" | "theme"
  > {
  maxADFee: string
}

export type TransactionMessage =
  | {
      type: "ALPH_EXECUTE_TRANSACTION"
      data: TransactionParams
    }
  | { type: "ALPH_EXECUTE_TRANSACTION_RES"; data: { actionHash: string } }
  | { type: "TRANSACTION_UPDATES"; data: Transaction[] }
  | {
      type: "ALPH_TRANSACTION_SUBMITTED"
      data: { result: TransactionResult["result"]; actionHash: string }
    }
  | {
      type: "ALPH_TRANSACTION_FAILED"
      data: { actionHash: string; error: string }
    }
  | { type: "ESTIMATE_TRANSACTION_FEE"; data: Call | Call[] }
  | { type: "ESTIMATE_TRANSACTION_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_TRANSACTION_FEE_RES"
      data: EstimateFeeResponse
    }
  | { type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE"; data?: BaseWalletAccount }
  | { type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES"
      data: DeclareDeployEstimateFeeResponse
    }
  | { type: "ESTIMATE_DECLARE_CONTRACT_FEE"; data: DeclareContract }
  | { type: "ESTIMATE_DECLARE_CONTRACT_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_DECLARE_CONTRACT_FEE_RES"
      data: DeclareDeployEstimateFeeResponse
    }
  | {
      type: "ESTIMATE_DEPLOY_CONTRACT_FEE"
      data: UniversalDeployerContractPayload
    }
  | { type: "ESTIMATE_DEPLOY_CONTRACT_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_DEPLOY_CONTRACT_FEE_RES"
      data: DeclareDeployEstimateFeeResponse
    }
