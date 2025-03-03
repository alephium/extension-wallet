import { Transaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { explorer, SignChainedTxParams, SignChainedTxResult, SignDeployContractChainedTxParams, SignDeployContractChainedTxResult, SignExecuteScriptChainedTxParams, SignExecuteScriptChainedTxResult, SignTransferChainedTxParams, SignTransferChainedTxResult, SignUnsignedTxResult } from '@alephium/web3'
import { ReviewTransactionResult, TransactionParams, TransactionResult } from "../../shared/actionQueue/types";

export const mapAlephiumTransactionToTransaction = (
  transaction: explorer.Transaction,
  account: WalletAccount,
  meta?: { title?: string; subTitle?: string; request?: ReviewTransactionResult },
): Transaction => ({
  hash: transaction.hash,
  account,
  meta: {
    ...meta,
    explorer: (meta === undefined || meta.request === undefined) ? transaction : undefined
  },
  status: "ACCEPTED_ON_CHAIN",
  timestamp: transaction.timestamp,
})

export function signedChainedTxParamsToTransactionParams(
  signedChainedTxParams: SignChainedTxParams,
  networkId: string
): TransactionParams {
  const paramsType = signedChainedTxParams.type
  const salt = Date.now().toString()
  switch (paramsType) {
    case 'Transfer':
      return {
        type: 'TRANSFER',
        params: { networkId, ...signedChainedTxParams },
        salt
      }
    case 'DeployContract':
      return {
        type: 'DEPLOY_CONTRACT',
        params: { networkId, ...signedChainedTxParams },
        salt
      }
    case 'ExecuteScript':
      return {
        type: 'EXECUTE_SCRIPT',
        params: { networkId, ...signedChainedTxParams },
        salt
      }
    default:
      throw new Error(`Unsupported transaction type: ${paramsType}`);
  }
}

export function transactionParamsToSignChainedTxParams(
  transactionParams: TransactionParams
): SignChainedTxParams {
  switch (transactionParams.type) {
    case "TRANSFER":
      return {
        type: 'Transfer',
        ...transactionParams.params
      } as SignTransferChainedTxParams
    case "DEPLOY_CONTRACT":
      return {
        type: 'DeployContract',
        ...transactionParams.params
        } as SignDeployContractChainedTxParams
    case "EXECUTE_SCRIPT":
      return {
        type: 'ExecuteScript',
        ...transactionParams.params
      } as SignExecuteScriptChainedTxParams
    default:
      throw new Error(`Unsupported transaction type: ${transactionParams.type}`);
  }
}

export function signedChainedTxResultToReviewTransactionResult(
  signedChainedTxParams: SignChainedTxParams,
  signedChainedTxResult: Omit<SignChainedTxResult, 'signature'>,
  networkId: string
): ReviewTransactionResult {
  const txParams = signedChainedTxParamsToTransactionParams(signedChainedTxParams, networkId)
  return {
    type: txParams.type,
    params: txParams.params,
    result: signedChainedTxResult
  } as ReviewTransactionResult
}

export function transactionResultToSignUnsignedTxResult(
  txResult: TransactionResult
): SignChainedTxResult {
  const txResultType = txResult.type
  switch (txResultType) {
    case 'TRANSFER':
      return { type: 'Transfer', ...txResult.result } as SignTransferChainedTxResult;
    case 'DEPLOY_CONTRACT':
      return { type: 'DeployContract', ...txResult.result } as SignDeployContractChainedTxResult;
    case 'EXECUTE_SCRIPT':
      return { type: 'ExecuteScript', ...txResult.result } as SignExecuteScriptChainedTxResult;
    default:
      throw new Error(`Unsupported transaction type: ${txResultType}`);
  }
}
