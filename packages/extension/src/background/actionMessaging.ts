import { ActionMessage } from "../shared/messages/ActionMessage"
import { handleActionApproval, handleActionRejection } from "./actionHandlers"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleActionMessage: HandleMessage<ActionMessage> = async ({
  msg,
  background,
  respond,
}) => {
  const { actionQueue } = background

  switch (msg.type) {
    case "GET_ACTIONS": {
      const actions = await actionQueue.getAll()
      return await sendMessageToUi({
        type: "GET_ACTIONS_RES",
        data: actions,
      })
    }

    case "APPROVE_ACTION": {
      const { actionHash, additionalData } = msg.data
      const action = await actionQueue.remove(actionHash)
      if (!action) {
        throw new Error("Action not found")
      }
      const resultMessage = await handleActionApproval(
        action,
        additionalData,
        background,
      )

      if (resultMessage) {
        await respond(resultMessage)
      }
      return
    }

    case "REJECT_ACTION": {
      const payload = msg.data.actionHash

      const actionHashes = Array.isArray(payload) ? payload : [payload]

      for (const actionHash of actionHashes) {
        const action = await actionQueue.remove(actionHash)
        if (!action) {
          throw new Error("Action not found")
        }
        const resultMessage = await handleActionRejection(action, background)
        if (resultMessage) {
          await respond(resultMessage)
        }
      }
      return
    }

    case "ALPH_SIGN_MESSAGE": {
      const { meta } = await actionQueue.push({
        type: "SIGN",
        payload: msg.data,
      })

      return await respond({
        type: "ALPH_SIGN_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "ALPH_SIGN_UNSIGNED_TX": {
      const { meta } = await actionQueue.push({
        type: 'SIGN_UNSIGNED_TX',
        payload: msg.data
      })

      return await respond({
        type: 'ALPH_SIGN_RES',
        data: {
          actionHash: meta.hash
        }
      })
    }

    case "SIGNATURE_FAILURE": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
