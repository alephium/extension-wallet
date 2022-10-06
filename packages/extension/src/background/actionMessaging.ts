import { ActionMessage } from '../shared/messages/ActionMessage'
import { handleActionApproval, handleActionRejection } from './actionHandlers'
import { UnhandledMessage } from './background'
import { HandleMessage } from './background'

export const handleActionMessage: HandleMessage<ActionMessage> = async ({ msg, background, sendToTabAndUi }) => {
  const { actionQueue } = background

  switch (msg.type) {
    case 'GET_ACTIONS': {
      const actions = await actionQueue.getAll()
      return sendToTabAndUi({
        type: 'GET_ACTIONS_RES',
        data: actions
      })
    }

    case 'APPROVE_ACTION': {
      const { actionHash } = msg.data
      const action = await actionQueue.remove(actionHash)
      if (!action) {
        throw new Error('Action not found')
      }
      const resultMessage = await handleActionApproval(action, background)

      if (resultMessage) {
        if (resultMessage.type === 'TRANSACTION_SUBMITTED') {
          // Send an extra message so that we can capture the result of the transaction
          sendToTabAndUi({
            type: 'TRANSACTION_SUCCESS',
            data: {
              tag: 'Success',
              ...resultMessage.data
            }
          })
          sendToTabAndUi(resultMessage)
        } else {
          sendToTabAndUi(resultMessage)
        }
      }
      return
    }

    case 'REJECT_ACTION': {
      const { actionHash } = msg.data
      const action = await actionQueue.remove(actionHash)
      if (!action) {
        throw new Error('Action not found')
      }
      const resultMessage = await handleActionRejection(action, background)
      if (resultMessage) {
        sendToTabAndUi(resultMessage)
      }
      return
    }

    case 'SIGNATURE_FAILURE': {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
