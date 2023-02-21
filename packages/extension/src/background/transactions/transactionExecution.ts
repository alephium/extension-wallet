import { BigNumber } from "ethers"
import {
  Call,
  EstimateFee,
  TransactionBulk,
  constants,
  number,
  stark,
} from "starknet"

import {
  ExtQueueItem,
  ReviewTransactionResult,
  TransactionParams,
  TransactionResult,
} from "../../shared/actionQueue/types"
import { getL1GasPrice } from "../../shared/ethersUtils"
import { AllowArray } from "../../shared/storage/types"
import { nameTransaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { accountsEqual } from "../../shared/wallet.service"
import { analytics } from "../analytics"
import { BackgroundService } from "../background"
import { argentMaxFee } from "../utils/argentMaxFee"
import { Wallet } from "../wallet"
import { addTransaction, transactionsStore } from "./store"

export const checkTransactionHash = (
  transactionHash?: number.BigNumberish,
): boolean => {
  try {
    if (!transactionHash) {
      throw Error("transactionHash not defined")
    }
    return true
  } catch {
    return false
  }
}

export const executeTransactionAction = async (
  transaction: ReviewTransactionResult,
  { wallet }: BackgroundService,
  networkId: string,
) => {
  const account = await wallet.getAccount({
    address: transaction.params.signerAddress,
    networkId: networkId,
  })
  await wallet.signAndSubmitUnsignedTx(account, {
    signerAddress: account.address,
    unsignedTx: transaction.result.unsignedTx,
  })

  if (account !== undefined) {
    addTransaction({
      account: account,
      hash: transaction.result.txId,
      meta: {
        reviewTxResult: transaction
      }
    })
  }
}

export const calculateEstimateFeeFromL1Gas = async (
  account: WalletAccount,
  transactions: AllowArray<Call>,
): Promise<EstimateFee> => {
  const fallbackPrice = number.toBN(10e14)
  try {
    if (account.networkId === "devnet") {
      console.log("Using fallback gas price for devnet")
      return {
        overall_fee: fallbackPrice,
        suggestedMaxFee: stark.estimatedFeeToMaxFee(fallbackPrice),
      }
    }

    const l1GasPrice = await getL1GasPrice(account.networkId)

    const callsLen = Array.isArray(transactions) ? transactions.length : 1
    const multiplier = BigNumber.from(3744)

    const price = l1GasPrice.mul(callsLen).mul(multiplier).toString()

    return {
      overall_fee: number.toBN(price),
      suggestedMaxFee: stark.estimatedFeeToMaxFee(price),
    }
  } catch {
    console.warn("Could not get L1 gas price")
    return {
      overall_fee: fallbackPrice,
      suggestedMaxFee: stark.estimatedFeeToMaxFee(fallbackPrice),
    }
  }
}
