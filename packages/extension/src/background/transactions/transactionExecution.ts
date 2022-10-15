import { PrivateKeyWallet } from '@alephium/web3-wallet'

import { TransactionPayload, TransactionResult } from '../../shared/transactions'
import { BackgroundService } from '../background'

export const executeAlephiumTransaction = async (
  payload: TransactionPayload,
  { wallet }: BackgroundService
): Promise<TransactionResult> => {
  const withSigner = async (
    func: (signer: PrivateKeyWallet) => Promise<TransactionResult>
  ): Promise<TransactionResult> => {
    const signer = await wallet.getAlephiumPrivateKeySigner()
    if (signer) {
      return await func(signer)
    } else {
      throw Error('Can not find signer')
    }
  }

  switch (payload.type) {
    case 'ALPH_SIGN_TRANSFER_TX': {
      return await withSigner(async (signer) => {
        const signResult = await signer.signTransferTx(payload.params)
        return {
          type: 'ALPH_SIGN_TRANSFER_TX_RES',
          result: signResult
        }
      })
    }

    case 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX': {
      return await withSigner(async (signer) => {
        const submissionResult = await signer.signAndSubmitTransferTx(payload.params)
        return {
          type: 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX_RES',
          result: submissionResult
        }
      })
    }

    case 'ALPH_SIGN_DEPLOY_CONTRACT_TX': {
      return await withSigner(async (signer) => {
        const signResult = await signer.signDeployContractTx(payload.params)
        return {
          type: 'ALPH_SIGN_DEPLOY_CONTRACT_TX_RES',
          result: signResult
        }
      })
    }

    case 'ALPH_SIGN_AND_SUBMIT_DEPLOY_CONTRACT_TX': {
      return await withSigner(async (signer) => {
        const submitResult = await signer.signAndSubmitDeployContractTx(payload.params)
        return {
          type: 'ALPH_SIGN_AND_SUBMIT_DEPLOY_CONTRACT_TX_RES',
          result: submitResult
        }
      })
    }

    case 'ALPH_SIGN_EXECUTE_SCRIPT_TX': {
      return await withSigner(async (signer) => {
        const signResult = await signer.signExecuteScriptTx(payload.params)
        return {
          type: 'ALPH_SIGN_EXECUTE_SCRIPT_TX_RES',
          result: signResult
        }
      })
    }

    case 'ALPH_SIGN_AND_SUBMIT_EXECUTE_SCRIPT_TX': {
      return await withSigner(async (signer) => {
        const submitResult = await signer.signAndSubmitExecuteScriptTx(payload.params)
        return {
          type: 'ALPH_SIGN_AND_SUBMIT_EXECUTE_SCRIPT_TX_RES',
          result: submitResult
        }
      })
    }

    case 'ALPH_SIGN_UNSIGNED_TX': {
      return await withSigner(async (signer) => {
        const signResult = await signer.signUnsignedTx(payload.params)
        return {
          type: 'ALPH_SIGN_UNSIGNED_TX_RES',
          result: signResult
        }
      })
    }

    case 'ALPH_SIGN_AND_SUBMIT_UNSIGNED_TX': {
      return await withSigner(async (signer) => {
        const submitResult = await signer.signAndSubmitUnsignedTx(payload.params)
        return {
          type: 'ALPH_SIGN_AND_SUBMIT_UNSIGNED_TX_RES',
          result: submitResult
        }
      })
    }

    case 'ALPH_SIGN_MESSAGE': {
      return await withSigner(async (signer) => {
        const signResult = await signer.signMessage(payload.params)
        return {
          type: 'ALPH_SIGN_MESSAGE_RES',
          result: signResult
        }
      })
    }
  }
}
