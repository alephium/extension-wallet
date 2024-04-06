import { NetworkMessage } from "../shared/messages/NetworkMessage"
import { getNetwork, getNetworkById, getNetworks } from "../shared/network"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { getNetworkStatuses } from "./networkStatus"

export const handleNetworkMessage: HandleMessage<NetworkMessage> = async ({
  msg,
  background: { actionQueue },
  respond,
}) => {
  switch (msg.type) {
    case "ALPH_GET_NETWORKS": {
      return respond({
        type: "ALPH_GET_NETWORKS_RES",
        data: await getNetworks(),
      })
    }

    case "ALPH_GET_NETWORK": {
      const allNetworks = await getNetworks()

      const network = allNetworks.find((n) => n.id === msg.data)

      if (!network) {
        throw new Error(`Network with id ${msg.data} not found`)
      }

      return respond({
        type: "ALPH_GET_NETWORK_RES",
        data: network,
      })
    }

    case "ALPH_GET_NETWORK_STATUSES": {
      const networks = msg.data?.length ? msg.data : await getNetworks()
      const statuses = await getNetworkStatuses(networks)
      return respond({
        type: "ALPH_GET_NETWORK_STATUSES_RES",
        data: statuses,
      })
    }

    case "ALPH_REQUEST_ADD_CUSTOM_NETWORK": {
      const exists = await getNetwork(msg.data.id)

      if (exists) {
        return respond({
          type: "ALPH_REQUEST_ADD_CUSTOM_NETWORK_REJ",
          data: {
            error: `Network with id ${msg.data.id} already exists`,
          },
        })
      }

      const { meta } = await actionQueue.push({
        type: "ALPH_REQUEST_ADD_CUSTOM_NETWORK",
        payload: msg.data,
      })

      return respond({
        type: "ALPH_REQUEST_ADD_CUSTOM_NETWORK_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK": {
      const { id } = msg.data

      const network = await getNetworkById(id)

      if (!network) {
        return respond({
          type: "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK_REJ",
          data: {
            error: `Network with id ${id} does not exist. Please add the network with wallet_addStarknetChain request`,
          },
        })
      }

      const { meta } = await actionQueue.push({
        type: "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK",
        payload: network,
      })

      return respond({
        type: "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "ALPH_REJECT_REQUEST_ADD_CUSTOM_NETWORK":
    case "ALPH_REJECT_REQUEST_SWITCH_CUSTOM_NETWORK": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
