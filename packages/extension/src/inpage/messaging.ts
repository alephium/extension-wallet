import { sendMessage, waitForMessage } from "./messageActions"

/** check if current host is pre-authorized against currently selected account */
export const getIsPreauthorized = async () => {
  try {
    sendMessage({
      type: "IS_PREAUTHORIZED",
      data: window.location.host,
    })
    const isPreauthorized = await waitForMessage("IS_PREAUTHORIZED_RES", 1000)
    return isPreauthorized
  } catch (e) {
    // ignore timeout or other error
  }
  return false
}

export const removePreAuthorization = async () => {
  try {
    sendMessage({
      type: "REMOVE_PREAUTHORIZATION",
      data: window.location.host,
    })
    await waitForMessage("REMOVE_PREAUTHORIZATION_RES", 1000)
  } catch (e) {
    console.error("Remove pre authorization failed", e)
  }
}

export const getNetwork = async (networkId: string) => {
  try {
    sendMessage({
      type: "GET_NETWORK",
      data: networkId,
    })
    return await waitForMessage("GET_NETWORK_RES", 2000)
  } catch (error) {
    console.error(`Error getting network: ${error} for networkId: ${networkId}`)
    throw error
  }
}
