import { Transaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { binToHex, explorer, hexToBinUnsafe, SignChainedTxParams, SignChainedTxResult, SignDeployContractChainedTxParams, SignDeployContractChainedTxResult, SignExecuteScriptChainedTxParams, SignExecuteScriptChainedTxResult, SignGrouplessTransferTxParams, SignGrouplessTxParams, SignTransferChainedTxParams, SignTransferChainedTxResult, SignTransferTxParams, SignUnsignedTxResult } from '@alephium/web3'
import { ReviewTransactionResult, TransactionParams, TransactionPayload, TransactionResult } from "../../shared/actionQueue/types";
import { codec } from "@alephium/web3";

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

export function transactionParamsToSignGrouplessTxParams(
  transactionParams: TransactionParams
): SignGrouplessTxParams {
  switch (transactionParams.type) {
    case "TRANSFER":
      return {
        fromAddress: transactionParams.params.signerAddress,
        destinations: transactionParams.params.destinations,
        gasPrice: transactionParams.params.gasPrice
      }
    case "DEPLOY_CONTRACT":
      return {
        fromAddress: transactionParams.params.signerAddress,
        bytecode: transactionParams.params.bytecode,
        initialAttoAlphAmount: transactionParams.params.initialAttoAlphAmount,
        initialTokenAmounts: transactionParams.params.initialTokenAmounts,
        issueTokenAmount: transactionParams.params.issueTokenAmount,
        issueTokenTo: transactionParams.params.issueTokenTo,
        gasPrice: transactionParams.params.gasPrice
      }
    case "EXECUTE_SCRIPT":
      return {
        fromAddress: transactionParams.params.signerAddress,
        bytecode: transactionParams.params.bytecode,
        attoAlphAmount: transactionParams.params.attoAlphAmount,
        tokens: transactionParams.params.tokens,
        gasPrice: transactionParams.params.gasPrice,
        gasEstimationMultiplier: transactionParams.params.gasEstimationMultiplier
      }
    default:
      throw new Error(`Unsupported transaction type: ${transactionParams.type}`)
  }
}

export function grouplessTxResultToReviewTransactionResult(
  signGrouplessTxResults: Omit<SignChainedTxResult, 'signature'>[],
  transactionParams: TransactionParams
): ReviewTransactionResult[] {
  if (signGrouplessTxResults.length === 0) {
    throw new Error("No groupless transaction results returned")
  }

  const lastIndex = signGrouplessTxResults.length - 1
  const initialResults = signGrouplessTxResults.slice(0, lastIndex)
  const lastResult = signGrouplessTxResults[lastIndex]

  const initialTransactions = initialResults.map((signGrouplessTxResult) => {
    if (signGrouplessTxResult.type !== 'Transfer') {
      throw new Error(`Invalid transaction type in groupless transfer: expected 'Transfer' but got '${signGrouplessTxResult.type}'.`)
    }

    const unsignedTx = codec.unsignedTxCodec.decode(hexToBinUnsafe(signGrouplessTxResult.unsignedTx))
    // TODO: Display move of assets for initial transactions properly
    const destinations = unsignedTx.fixedOutputs.map(output => ({
      address: transactionParams.params.signerAddress,
      attoAlphAmount: output.amount,
      tokens: output.tokens?.map(token => ({
        id: binToHex(token.tokenId),
        amount: token.amount
      }))
    }))
    const params: TransactionPayload<SignTransferTxParams> = {
      networkId: transactionParams.params.networkId,
      signerAddress: transactionParams.params.signerAddress,
      signerKeyType: transactionParams.params.signerKeyType,
      destinations: destinations,
      gasPrice: unsignedTx.gasPrice,
    }
    return {
      type: "TRANSFER",
      params,
      result: signGrouplessTxResult
    } as ReviewTransactionResult
  })

  const lastTransaction = {
    type: transactionParams.type,
    params: transactionParams.params,
    result: lastResult
  } as ReviewTransactionResult

  return [...initialTransactions, lastTransaction]
}
