import { isDappMessageHasherAllowed } from "../shared/messageHasher"
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
    case "ALPH_GET_ACTIONS": {
      const actions = await actionQueue.getAll()
      return await sendMessageToUi({
        type: "ALPH_GET_ACTIONS_RES",
        data: actions,
      })
    }

    case "ALPH_APPROVE_ACTION": {
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

    case "ALPH_REJECT_ACTION": {
      const payload = msg.data.actionHash

      const actionHashes = Array.isArray(payload) ? payload : [payload]

      for (const actionHash of actionHashes) {
        const action = await actionQueue.remove(actionHash)
        if (!action) {
          throw new Error("Action not found")
        }
        const resultMessage = await handleActionRejection(action, background, msg.data.error)
        if (resultMessage) {
          await respond(resultMessage)
        }
      }
      return
    }

    case "ALPH_SIGN_MESSAGE": {
      if (!isDappMessageHasherAllowed(msg.data.messageHasher)) {
        const rejectedActionHash = "rejected-unsupported-message-hasher"
        await respond({
          type: "ALPH_SIGN_MESSAGE_RES",
          data: {
            actionHash: rejectedActionHash,
          },
        })
        return await respond({
          type: "ALPH_SIGN_MESSAGE_FAILURE",
          data: {
            actionHash: rejectedActionHash,
            error:
              "Unsupported message hasher. Only the 'alephium' message hasher is accepted.",
          },
        })
      }

      const { meta } = await actionQueue.push({
        type: "ALPH_SIGN_MESSAGE",
        payload: msg.data,
      })

      return await respond({
        type: "ALPH_SIGN_MESSAGE_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "ALPH_SIGN_UNSIGNED_TX": {
      const { meta } = await actionQueue.push({
        type: 'ALPH_SIGN_UNSIGNED_TX',
        payload: msg.data
      })

      return await respond({
        type: 'ALPH_SIGN_UNSIGNED_TX_RES',
        data: {
          actionHash: meta.hash
        }
      })
    }

    case "ALPH_SIGN_MESSAGE_FAILURE": {
      return await actionQueue.remove(msg.data.actionHash)
    }

    case "ALPH_SIGN_UNSIGNED_TX_FAILURE": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
