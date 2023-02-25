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

export const handleActionApproval = async (
  action: ExtQueueItem<ActionItem>,
  additionalData: any | undefined,
  background: BackgroundService,
): Promise<MessageType | undefined> => {
  const { wallet } = background
  const actionHash = action.meta.hash

  switch (action.type) {
    case "CONNECT_DAPP": {
      const { host, networkId, group, keyType } = action.payload
      const selectedAccount = await wallet.getAlephiumSelectedAddress(networkId, group, keyType)

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
      return { type: "CONNECT_DAPP_RES", data: walletAccountWithNetwork }
    }

    case "TRANSACTION": {
      const transaction = additionalData as ReviewTransactionResult
      try {
        await executeTransactionAction(
          transaction,
          background,
          transaction.params.networkId,
        )

        return {
          type: "TRANSACTION_SUBMITTED",
          data: { result: transaction.result, actionHash },
        }
      } catch (error: unknown) {
        return {
          type: "TRANSACTION_FAILED",
          data: { actionHash, error: `${error}` },
        }
      }
    }

    case "SIGN": {
      const account = await wallet.selectAccount({ address: action.payload.signerAddress, networkId: action.payload.networkId })
      if (!account) {
        throw Error("No selected account")
      }

      const result = await wallet.signMessage(account, action.payload)

      return {
        type: "SIGNATURE_SUCCESS",
        data: {
          signature: result.signature,
          actionHash,
        },
      }
    }

    case "REQUEST_ADD_CUSTOM_NETWORK": {
      try {
        await addNetwork(action.payload)
        return {
          type: "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        }
      } catch (error) {
        return {
          type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        }
      }
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      try {
        const networks = await getNetworks()

        const { chainId } = action.payload

        const network = networks.find((n) => n.chainId === chainId)

        if (!network) {
          throw Error(`Network with chainId ${chainId} not found`)
        }

        const accountsOnNetwork = await getAccounts((account) => {
          return account.networkId === network.id && !account.hidden
        })

        if (!accountsOnNetwork.length) {
          throw Error(`No accounts found on network with chainId ${chainId}`)
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
          throw Error(`No accounts found on network with chainId ${chainId}`)
        }

        return {
          type: "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
          data: { actionHash, selectedAccount },
        }
      } catch (error) {
        return {
          type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
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
): Promise<MessageType | undefined> => {
  const actionHash = action.meta.hash

  switch (action.type) {
    case "CONNECT_DAPP": {
      return {
        type: "REJECT_PREAUTHORIZATION",
        data: {
          host: action.payload.host,
          actionHash,
        },
      }
    }

    case "TRANSACTION": {
      return {
        type: "TRANSACTION_FAILED",
        data: { actionHash },
      }
    }

    case "SIGN": {
      return {
        type: "SIGNATURE_FAILURE",
        data: { actionHash },
      }
    }

    case "REQUEST_ADD_CUSTOM_NETWORK": {
      return {
        type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
        data: { actionHash },
      }
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      return {
        type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
        data: { actionHash },
      }
    }

    default:
      assertNever(action)
  }
}
