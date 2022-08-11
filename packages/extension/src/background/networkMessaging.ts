import { NetworkMessage } from "../shared/messages/NetworkMessage"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { getCurrentNetwork, getNetworkById, hasNetwork } from "./customNetworks"
import {
  addNetworks,
  getNetworks,
  removeNetworks,
  setCurrentNetwork,
} from "./customNetworks"

export const handleNetworkMessage: HandleMessage<NetworkMessage> = async ({
  msg,
  background: { actionQueue },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_CUSTOM_NETWORKS": {
      const networks = await getNetworks()
      return sendToTabAndUi({
        type: "GET_CUSTOM_NETWORKS_RES",
        data: networks,
      })
    }

    case "ADD_CUSTOM_NETWORKS": {
      const networks = msg.data
      const newNetworks = await addNetworks(networks)
      return sendToTabAndUi({
        type: "ADD_CUSTOM_NETWORKS_RES",
        data: newNetworks,
      })
    }

    case "REMOVE_CUSTOM_NETWORKS": {
      const networks = msg.data
      return sendToTabAndUi({
        type: "REMOVE_CUSTOM_NETWORKS_RES",
        data: await removeNetworks(networks),
      })
    }

    case "GET_CURRENT_NETWORK": {
      const networkId = await getCurrentNetwork()
      return sendToTabAndUi({
        type: "GET_CURRENT_NETWORK_RES",
        data: { networkId },
      })
    }

    case "SET_CURRENT_NETWORK": {
      await setCurrentNetwork(msg.data.networkId)
      return sendToTabAndUi({
        type: "SET_CURRENT_NETWORK_RES",
      })
    }

    case "REQUEST_ADD_CUSTOM_NETWORK": {
      const exists = await hasNetwork(msg.data.id)

      if (exists) {
        return sendToTabAndUi({
          type: "REQUEST_ADD_CUSTOM_NETWORK_RES",
          data: {},
        })
      }

      const { meta } = await actionQueue.push({
        type: "REQUEST_ADD_CUSTOM_NETWORK",
        payload: msg.data,
      })

      return sendToTabAndUi({
        type: "REQUEST_ADD_CUSTOM_NETWORK_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      const network = await getNetworkById(msg.data.id)

      if (!network) {
        return sendToTabAndUi({
          type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
          data: {},
        })
      }

      const { meta } = await actionQueue.push({
        type: "REQUEST_SWITCH_CUSTOM_NETWORK",
        payload: network,
      })

      return sendToTabAndUi({
        type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "REJECT_REQUEST_ADD_CUSTOM_NETWORK":
    case "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
