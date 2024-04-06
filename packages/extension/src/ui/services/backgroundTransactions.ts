import { Call, UniversalDeployerContractPayload } from "starknet"
import { TransactionParams } from "../../shared/actionQueue/types"

import { sendMessage, waitForMessage } from "../../shared/messages"
import { DeclareContract } from "../../shared/udc/type"
import { BaseWalletAccount } from "../../shared/wallet.model"

export const executeTransaction = (data: TransactionParams) => {
  return sendMessage({ type: "ALPH_EXECUTE_TRANSACTION", data })
}

export const getEstimatedFee = async (call: Call | Call[]) => {
  sendMessage({ type: "ESTIMATE_TRANSACTION_FEE", data: call })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_TRANSACTION_FEE_RES"),
    waitForMessage("ESTIMATE_TRANSACTION_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}

export const getAccountDeploymentEstimatedFee = async (
  account?: BaseWalletAccount,
) => {
  throw Error('Not Implemented')
}

export const getDeclareContractEstimatedFee = async (data: DeclareContract) => {
  sendMessage({ type: "ESTIMATE_DECLARE_CONTRACT_FEE", data })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_DECLARE_CONTRACT_FEE_RES"),
    waitForMessage("ESTIMATE_DECLARE_CONTRACT_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}

export const getDeployContractEstimatedFee = async (
  data: UniversalDeployerContractPayload,
) => {
  sendMessage({ type: "ESTIMATE_DEPLOY_CONTRACT_FEE", data })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_DEPLOY_CONTRACT_FEE_RES"),
    waitForMessage("ESTIMATE_DEPLOY_CONTRACT_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}

// for debugging purposes
try {
  ; (window as any).downloadBackup = () => {
    sendMessage({ type: "ALPH_DOWNLOAD_BACKUP_FILE" })
  }
} catch {
  // ignore
}
