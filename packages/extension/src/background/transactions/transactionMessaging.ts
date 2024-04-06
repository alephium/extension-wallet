import { Account, number, stark } from "starknet"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import { HandleMessage, UnhandledMessage } from "../background"

export const handleTransactionMessage: HandleMessage<
  TransactionMessage
> = async ({ msg, background: { wallet, actionQueue }, respond: respond }) => {
  switch (msg.type) {
    case "ALPH_EXECUTE_TRANSACTION": {
      const { meta } = await actionQueue.push({
        type: "ALPH_TRANSACTION",
        payload: msg.data,
      })

      return respond({
        type: "ALPH_EXECUTE_TRANSACTION_RES",
        data: { actionHash: meta.hash },
      })
    }

    case "ESTIMATE_TRANSACTION_FEE": {
      const selectedAccount = await wallet.getSelectedAccount()
      //const transactions = msg.data
      if (!selectedAccount) {
        throw Error("no accounts")
      }
      try {
        // FIXME: All set to 0 now.
        return respond({
          type: "ESTIMATE_TRANSACTION_FEE_RES",
          data: {
            amount: "0",
            suggestedMaxFee: "0",
            accountDeploymentFee: "0",
            maxADFee: "0",
          },
        })
      } catch (error) {
        console.error(error)
        return respond({
          type: "ESTIMATE_TRANSACTION_FEE_REJ",
          data: {
            error:
              (error as any)?.message?.toString?.() ??
              (error as any)?.toString?.() ??
              "Unkown error",
          },
        })
      }
    }

    case "ESTIMATE_DECLARE_CONTRACT_FEE": {
      const { classHash, contract, ...restData } = msg.data

      const selectedAccount = null  // FIXME

      if (!selectedAccount) {
        throw Error("no accounts")
      }
      try {
        const { overall_fee, suggestedMaxFee } = await (
          selectedAccount as Account
        ).estimateDeclareFee({
          classHash,
          contract,
        })

        const maxADFee = number.toHex(
          stark.estimatedFeeToMaxFee(suggestedMaxFee, 1), // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x
        )

        return respond({
          type: "ESTIMATE_DECLARE_CONTRACT_FEE_RES",
          data: {
            amount: number.toHex(overall_fee),
            maxADFee,
          },
        })
      } catch (error) {
        console.error(error)
        return respond({
          type: "ESTIMATE_DECLARE_CONTRACT_FEE_REJ",
          data: {
            error:
              (error as any)?.message?.toString?.() ??
              (error as any)?.toString?.() ??
              "Unkown error",
          },
        })
      }
    }

    case "ESTIMATE_DEPLOY_CONTRACT_FEE": {
      const { classHash, constructorCalldata, salt, unique } = msg.data

      const selectedAccount = null // FIXME

      if (!selectedAccount) {
        throw Error("no accounts")
      }
      try {
        const { overall_fee, suggestedMaxFee } = await (
          selectedAccount as Account
        ).estimateDeployFee({
          classHash,
          salt,
          unique,
          constructorCalldata,
        })
        const maxADFee = number.toHex(
          stark.estimatedFeeToMaxFee(suggestedMaxFee, 1), // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x
        )

        return respond({
          type: "ESTIMATE_DEPLOY_CONTRACT_FEE_RES",
          data: {
            amount: number.toHex(overall_fee),
            maxADFee,
          },
        })
      } catch (error) {
        console.log(error)
        return respond({
          type: "ESTIMATE_DEPLOY_CONTRACT_FEE_REJ",
          data: {
            error:
              (error as any)?.message?.toString() ??
              (error as any)?.toString() ??
              "Unkown error",
          },
        })
      }
    }

    case "ALPH_TRANSACTION_FAILED": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
