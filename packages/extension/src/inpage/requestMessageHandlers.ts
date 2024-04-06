import type { Network } from "../shared/network"
import { AddNewTokenParameters } from "@alephium/get-extension-wallet"
import type { AddStarknetChainParameters } from "./inpage.model"
import { sendMessage, waitForMessage } from "./messageActions"

export async function handleAddTokenRequest(
  callParams: AddNewTokenParameters,
): Promise<boolean> {
  sendMessage({
    type: "ALPH_REQUEST_ADD_TOKEN",
    data: {
      id: callParams.id,
      networkId: callParams.networkId,
      symbol: callParams.symbol,
      decimals: callParams.decimals,
      name: callParams.name,
      logoURI: callParams.logoURI
    },
  })
  const { actionHash } = await waitForMessage("ALPH_REQUEST_ADD_TOKEN_RES", 1000)

  if (!actionHash) {
    // token already exists
    return false
  }

  sendMessage({ type: "ALPH_OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "ALPH_APPROVE_REQUEST_ADD_TOKEN",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "ALPH_REJECT_REQUEST_ADD_TOKEN",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({ type: "ALPH_REJECT_REQUEST_ADD_TOKEN", data: { actionHash } })
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

export async function handleAddNetworkRequest(
  callParams: AddStarknetChainParameters,
): Promise<boolean> {
  sendMessage({
    type: "ALPH_REQUEST_ADD_CUSTOM_NETWORK",
    data: {
      id: callParams.id,
      name: callParams.chainName,
      explorerApiUrl: callParams.explorerApiUrl,
      nodeUrl: callParams.nodeUrl,
      explorerUrl: callParams.explorerUrl,
    },
  })

  const req = await Promise.race([
    waitForMessage("ALPH_REQUEST_ADD_CUSTOM_NETWORK_RES", 1000),
    waitForMessage("ALPH_REQUEST_ADD_CUSTOM_NETWORK_REJ", 1000),
  ])

  if ("error" in req) {
    throw Error(req.error)
  }

  const { actionHash } = req

  sendMessage({ type: "ALPH_OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "ALPH_APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "ALPH_REJECT_REQUEST_ADD_CUSTOM_NETWORK",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({
          type: "ALPH_REJECT_REQUEST_ADD_CUSTOM_NETWORK",
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
    type: "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK",
    data: { id: callParams.id },
  })

  const req = await Promise.race([
    waitForMessage("ALPH_REQUEST_SWITCH_CUSTOM_NETWORK_RES", 1000),
    waitForMessage("ALPH_REQUEST_SWITCH_CUSTOM_NETWORK_REJ", 1000),
  ])

  if ("error" in req) {
    throw Error(req.error)
  }

  const { actionHash } = req

  sendMessage({ type: "ALPH_OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "ALPH_APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "ALPH_REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({
          type: "ALPH_REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
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
