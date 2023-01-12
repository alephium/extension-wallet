import { ActionItem } from '../shared/actionQueue'
import { MessageType } from '../shared/messages'
import { assertNever } from '../ui/services/assertNever'
import { ExtQueueItem } from './actionQueue'
import { BackgroundService } from './background'
import { openUi } from './openUi'
import { preAuthorize } from './preAuthorizations'
import { executeAlephiumTransaction } from './transactions/transactionExecution'

export const handleActionApproval = async (
  action: ExtQueueItem<ActionItem>,
  background: BackgroundService
): Promise<MessageType | undefined> => {
  const { wallet } = background
  const actionHash = action.meta.hash

  switch (action.type) {
    case 'CONNECT_DAPP': {
      const { host } = action.payload
      const defaultAddress = await wallet.getAlephiumDefaultAddress()

      if (!defaultAddress) {
        openUi()
        return
      }

      await preAuthorize(host)

      return { type: 'CONNECT_DAPP_RES', data: defaultAddress }
    }

    case 'TRANSACTION': {
      try {
        const response = await executeAlephiumTransaction(action.payload, background)
        return {
          type: 'TRANSACTION_SUBMITTED',
          data: { txResult: response, actionHash }
        }
      } catch (error: any) {
        return {
          type: 'TRANSACTION_FAILED',
          data: { tag: 'Failure', actionHash, error: `${error}` }
        }
      }
    }

    case 'REQUEST_ADD_CUSTOM_NETWORK': {
      return {
        type: 'APPROVE_REQUEST_ADD_CUSTOM_NETWORK',
        data: { actionHash }
      }
    }

    case 'REQUEST_SWITCH_CUSTOM_NETWORK': {
      return {
        type: 'APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK',
        data: { actionHash }
      }
    }

    default:
      assertNever(action)
  }
}

export const handleActionRejection = async (
  action: ExtQueueItem<ActionItem>,
  _: BackgroundService
): Promise<MessageType | undefined> => {
  const actionHash = action.meta.hash

  switch (action.type) {
    case 'CONNECT_DAPP': {
      return {
        type: 'REJECT_PREAUTHORIZATION',
        data: {
          host: action.payload.host,
          actionHash
        }
      }
    }

    case 'TRANSACTION': {
      return {
        type: 'TRANSACTION_REJECTED',
        data: { tag: 'Rejected', actionHash }
      }
    }

    case 'REQUEST_ADD_CUSTOM_NETWORK': {
      return {
        type: 'REJECT_REQUEST_ADD_CUSTOM_NETWORK',
        data: { actionHash }
      }
    }

    case 'REQUEST_SWITCH_CUSTOM_NETWORK': {
      return {
        type: 'REJECT_REQUEST_SWITCH_CUSTOM_NETWORK',
        data: { actionHash }
      }
    }

    default:
      assertNever(action)
  }
}
