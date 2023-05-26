import { TokenMessage } from "../shared/messages/TokenMessage"
import { defaultNetwork } from "../shared/network"
import { hasToken } from "../shared/token/storage"
import { HandleMessage, UnhandledMessage } from "./background"

export const handleTokenMessaging: HandleMessage<TokenMessage> = async ({
  msg,
  background: { actionQueue, wallet },
  respond,
}) => {
  switch (msg.type) {
    case "REQUEST_ADD_TOKEN": {
      const selectedAccount = await wallet.getSelectedAccount()
      const networkId = msg.data.networkId ?? selectedAccount?.networkId ?? defaultNetwork.id
      const exists = await hasToken({
        networkId: networkId,
        id: msg.data.id,
      })

      if (!exists) {
        const { meta } = await actionQueue.push({
          type: "REQUEST_ADD_TOKEN",
          payload: msg.data,
        })

        return respond({
          type: "REQUEST_ADD_TOKEN_RES",
          data: {
            actionHash: meta.hash,
          },
        })
      }

      return respond({
        type: "REQUEST_ADD_TOKEN_RES",
        data: {},
      })
    }

    case "REJECT_REQUEST_ADD_TOKEN": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
