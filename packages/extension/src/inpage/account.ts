import { sendMessage } from "./messageActions"

export const disconnectAccount = async () => {
  sendMessage({ type: "ALPH_DISCONNECT_ACCOUNT" })
}
