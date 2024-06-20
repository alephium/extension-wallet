import i18n from "../../i18n"
import { sendMessage, waitForMessage } from "../../shared/messages"
import { encryptForBackground } from "./crypto"

export const hasActiveSession = async () => {
  sendMessage({ type: "ALPH_HAS_SESSION" })
  return waitForMessage("ALPH_HAS_SESSION_RES")
}

export const isInitialized = async () => {
  sendMessage({ type: "ALPH_IS_INITIALIZED" })
  return await waitForMessage("ALPH_IS_INITIALIZED_RES")
}

export const startSession = async (password: string): Promise<void> => {
  const body = await encryptForBackground(password)

  sendMessage({ type: "ALPH_START_SESSION", data: { secure: true, body } })

  const succeeded = await Promise.race([
    waitForMessage("ALPH_START_SESSION_RES").then(() => true),
    waitForMessage("ALPH_START_SESSION_REJ")
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) {
    throw Error(i18n.t("Incorrect password"))
  }
}

export const stopSession = () => {
  sendMessage({ type: "ALPH_STOP_SESSION" })
}

export const checkPassword = async (password: string): Promise<boolean> => {
  const body = await encryptForBackground(password)

  sendMessage({ type: "ALPH_CHECK_PASSWORD", data: { body } })

  return await Promise.race([
    waitForMessage("ALPH_CHECK_PASSWORD_RES").then(() => true),
    waitForMessage("ALPH_CHECK_PASSWORD_REJ")
      .then(() => false)
      .catch(() => false),
  ])
}
