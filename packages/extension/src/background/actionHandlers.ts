import { TransactionBuilder } from "@alephium/web3"
import { getAccounts } from "../shared/account/store"
import {
  ActionItem,
  ExtQueueItem,
  ReviewTransactionResult,
} from "../shared/actionQueue/types"
import { MessageType } from "../shared/messages"
import { addNetwork, getNetworks } from "../shared/network"
import { preAuthorize } from "../shared/preAuthorizations"
import { isEqualWalletAddress, withNetwork } from "../shared/wallet.service"
import { assertNever } from "../ui/services/assertNever"
import { analytics } from "./analytics"
import { BackgroundService } from "./background"
import { openUi } from "./openUi"
import { executeTransactionAction } from "./transactions/transactionExecution"
import { transactionWatcher } from "./transactions/transactionWatcher"

export const handleActionApproval = async (
  action: ExtQueueItem<ActionItem>,
  additionalData: any | undefined,
  background: BackgroundService,
): Promise<MessageType | undefined> => {
  const { wallet } = background
  const actionHash = action.meta.hash

  switch (action.type) {
    case "ALPH_CONNECT_DAPP": {
      const { host, networkId, group, keyType } = action.payload
      const selectedAccount = await wallet.getAlephiumSelectedAddress(
        networkId,
        group,
        keyType,
      )

      if (!selectedAccount) {
        openUi()
        return
      }

      analytics.track("preauthorizeDapp", {
        host,
        networkId: selectedAccount.networkId,
      })

      await preAuthorize(selectedAccount, host)

      const walletAccountWithNetwork = await withNetwork(selectedAccount)
      return { type: "ALPH_CONNECT_DAPP_RES", data: walletAccountWithNetwork }
    }

    case "ALPH_TRANSACTION": {
      const { signature: signatureOpt, ...transaction } =
        additionalData as ReviewTransactionResult & { signature?: string }
      try {
        const { signature } = await executeTransactionAction(
          transaction,
          signatureOpt,
          background,
          transaction.params.networkId,
        )

        transactionWatcher.refresh()

        return {
          type: "ALPH_TRANSACTION_SUBMITTED",
          data: { result: { ...transaction.result, signature }, actionHash },
        }
      } catch (error: unknown) {
        return {
          type: "ALPH_TRANSACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "ALPH_SIGN_MESSAGE": {
      try {
        const account = await wallet.getAccount({
          address: action.payload.signerAddress,
          networkId: action.payload.networkId,
        })
        if (!account) {
          throw Error("No selected account")
        }
        if (account.signer.type === 'ledger') {
          throw Error("Signing messages with Ledger accounts is not supported")
        }

        const result = await wallet.signMessage(account, action.payload)

        return {
          type: "ALPH_SIGN_MESSAGE_SUCCESS",
          data: {
            signature: result.signature,
            actionHash,
          },
        }
      } catch (error) {
        return {
          type: "ALPH_SIGN_MESSAGE_FAILURE",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "ALPH_SIGN_UNSIGNED_TX": {
      const { signatureOpt } = additionalData as { signatureOpt: string | undefined }
      try {
        const account = await wallet.getAccount({
          address: action.payload.signerAddress,
          networkId: action.payload.networkId,
        })
        if (!account) {
          throw Error("No selected account")
        }
        if (signatureOpt === undefined) {
          const result = await wallet.signUnsignedTx(account, action.payload)

          return {
            type: "ALPH_SIGN_UNSIGNED_TX_SUCCESS",
            data: { actionHash, result },
          }
        } else {
          const signUnsignedTxResult = TransactionBuilder.buildUnsignedTx({
            signerAddress: account.address,
            unsignedTx: action.payload.unsignedTx
          })
          const result = { signature: signatureOpt, ...signUnsignedTxResult }
          return {
            type: "ALPH_SIGN_UNSIGNED_TX_SUCCESS",
            data: { actionHash, result },
          }
        }
      } catch (error) {
        return {
          type: "ALPH_SIGN_UNSIGNED_TX_FAILURE",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "ALPH_REQUEST_ADD_TOKEN": {
      return {
        type: "ALPH_APPROVE_REQUEST_ADD_TOKEN",
        data: { actionHash },
      }
    }

    case "ALPH_REQUEST_ADD_CUSTOM_NETWORK": {
      try {
        await addNetwork(action.payload)
        return {
          type: "ALPH_APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        }
      } catch (error) {
        return {
          type: "ALPH_REJECT_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        }
      }
    }

    case "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK": {
      try {
        const networks = await getNetworks()

        const { id } = action.payload

        const network = networks.find((n) => n.id === id)

        if (!network) {
          throw Error(`Network with id ${id} not found`)
        }

        const accountsOnNetwork = await getAccounts((account) => {
          return account.networkId === network.id && !account.hidden
        })

        if (!accountsOnNetwork.length) {
          throw Error(`No accounts found on network with id ${id}`)
        }

        const currentlySelectedAccount = await wallet.getSelectedAccount()

        const existingAccountOnNetwork =
          currentlySelectedAccount &&
          accountsOnNetwork.find((account) =>
            isEqualWalletAddress(account, currentlySelectedAccount),
          )

        const selectedAccount = await wallet.selectAccount(
          existingAccountOnNetwork ?? accountsOnNetwork[0],
        )

        if (!selectedAccount) {
          throw Error(`No accounts found on network with id ${id}`)
        }

        return {
          type: "ALPH_APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
          data: { actionHash, selectedAccount },
        }
      } catch (error) {
        return {
          type: "ALPH_REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
          data: { actionHash },
        }
      }
    }

    default:
      assertNever(action)
  }
}

export const handleActionRejection = async (
  action: ExtQueueItem<ActionItem>,
  _: BackgroundService,
  error: string
): Promise<MessageType | undefined> => {
  const actionHash = action.meta.hash

  switch (action.type) {
    case "ALPH_CONNECT_DAPP": {
      return {
        type: "ALPH_REJECT_PREAUTHORIZATION",
        data: {
          host: action.payload.host,
          actionHash,
        },
      }
    }

    case "ALPH_TRANSACTION": {
      return {
        type: "ALPH_TRANSACTION_FAILED",
        data: { actionHash, error: error },
      }
    }

    case "ALPH_SIGN_MESSAGE": {
      return {
        type: "ALPH_SIGN_MESSAGE_FAILURE",
        data: { actionHash, error },
      }
    }

    case "ALPH_SIGN_UNSIGNED_TX": {
      return {
        type: "ALPH_SIGN_UNSIGNED_TX_FAILURE",
        data: { actionHash, error },
      }
    }

    case "ALPH_REQUEST_ADD_TOKEN": {
      return {
        type: "ALPH_REJECT_REQUEST_ADD_TOKEN",
        data: { actionHash },
      }
    }

    case "ALPH_REQUEST_ADD_CUSTOM_NETWORK": {
      return {
        type: "ALPH_REJECT_REQUEST_ADD_CUSTOM_NETWORK",
        data: { actionHash },
      }
    }

    case "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK": {
      return {
        type: "ALPH_REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
        data: { actionHash },
      }
    }

    default:
      assertNever(action)
  }
}
