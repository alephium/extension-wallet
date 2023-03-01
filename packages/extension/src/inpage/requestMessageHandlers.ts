import type { Network } from "../shared/network"
import type {
  AddStarknetChainParameters,
  WatchAssetParameters,
} from "./inpage.model"
import { sendMessage, waitForMessage } from "./messageActions"

export async function handleAddNetworkRequest(
  callParams: AddStarknetChainParameters,
): Promise<boolean> {
  sendMessage({
    type: "REQUEST_ADD_CUSTOM_NETWORK",
    data: {
      id: callParams.id,
      name: callParams.chainName,
      explorerApiUrl: callParams.explorerApiUrl,
      nodeUrl: callParams.nodeUrl,
      explorerUrl: callParams.explorerUrl,
    },
  })

  const req = await Promise.race([
    waitForMessage("REQUEST_ADD_CUSTOM_NETWORK_RES", 1000),
    waitForMessage("REQUEST_ADD_CUSTOM_NETWORK_REJ", 1000),
  ])

  if ("error" in req) {
    throw Error(req.error)
  }

  const { actionHash } = req

  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({
          type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        })
        return "timeout" as const
      }),
  ])

  if (result === "error") {
    throw Error("User abort")
  }
  if (result === "timeout") {
    throw Error("User action timed out")
  }

  return true
}

export async function handleSwitchNetworkRequest(callParams: {
  id: Network["id"]
}): Promise<boolean> {
  sendMessage({
    type: "REQUEST_SWITCH_CUSTOM_NETWORK",
    data: { id: callParams.id },
  })

  const req = await Promise.race([
    waitForMessage("REQUEST_SWITCH_CUSTOM_NETWORK_RES", 1000),
    waitForMessage("REQUEST_SWITCH_CUSTOM_NETWORK_REJ", 1000),
  ])

  if ("error" in req) {
    throw Error(req.error)
  }

  const { actionHash } = req

  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({
          type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
          data: { actionHash },
        })
        return "timeout" as const
      }),
  ])

  if (result === "error") {
    throw Error("User abort")
  }
  if (result === "timeout") {
    throw Error("User action timed out")
  }

  return true
}
