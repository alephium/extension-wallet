import { sendMessage, waitForMessage } from "./messageActions"
import { RequestOptions } from "./inpage.model"

/** check if current host is pre-authorized against currently selected account */
export const getIsPreauthorized = async (options: RequestOptions) => {
  try {
    sendMessage({
      type: "ALPH_IS_PREAUTHORIZED",
      data: options,
    })
    const isPreauthorized = await waitForMessage("ALPH_IS_PREAUTHORIZED_RES", 1000)
    return isPreauthorized
  } catch (e) {
    // ignore timeout or other error
  }
  return false
}

export const removePreAuthorization = async () => {
  try {
    sendMessage({
      type: "ALPH_REMOVE_PREAUTHORIZATION",
      data: window.location.host,
    })
    await waitForMessage("ALPH_REMOVE_PREAUTHORIZATION_RES", 1000)
  } catch (e) {
    console.error("Remove pre authorization failed", e)
  }
}

export const getNetwork = async (networkId: string) => {
  try {
    sendMessage({
      type: "ALPH_GET_NETWORK",
      data: networkId,
    })
    return await waitForMessage("ALPH_GET_NETWORK_RES", 2000)
  } catch (error) {
    console.error(`Error getting network: ${error} for networkId: ${networkId}`)
    throw error
  }
}
