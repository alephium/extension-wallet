import { PrivateKeyWallet } from '@alephium/web3-wallet'

import {
  TransactionPayload,
  TransactionResult,
} from "../../shared/transactions"
import { BackgroundService } from "../background"

export const executeAlephiumTransaction = async (
  payload: TransactionPayload,
  { wallet }: BackgroundService,
): Promise<TransactionResult> => {
  const withSigner = async (
    func: (signer: PrivateKeyWallet) => Promise<TransactionResult>,
  ): Promise<TransactionResult> => {
    const signer = await wallet.getAlephiumPrivateKeySigner()
    if (signer) {
      return await func(signer)
    } else {
      throw Error("Can not find signer")
    }
  }

  switch (payload.type) {
    case "ALPH_SIGN_TRANSFER_TX": {
      return await withSigner(async (signer) => {
        const signResult = await signer.signTransferTx(payload.params)
        return {
          type: "ALPH_SIGN_TRANSFER_TX_RES",
          result: signResult,
        }
      })
    }

    case "ALPH_SIGN_CONTRACT_CREATION_TX": {
      return await withSigner(async (signer) => {
        const signResult = await signer.signDeployContractTx(payload.params)
        return {
          type: "ALPH_SIGN_CONTRACT_CREATION_TX_RES",
          result: signResult,
        }
      })
    }

    case "ALPH_SIGN_SCRIPT_TX": {
      return await withSigner(async (signer) => {
        const signResult = await signer.signExecuteScriptTx(payload.params)
        return {
          type: "ALPH_SIGN_SCRIPT_TX_RES",
          result: signResult,
        }
      })
    }
  }
}
