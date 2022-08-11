import { compactDecrypt } from "jose"

import { SessionMessage } from "../shared/messages/SessionMessage"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { arrayBufferToString } from "./utils/encode"

export const handleSessionMessage: HandleMessage<SessionMessage> = async ({
  msg,
  background: { wallet },
  messagingKeys: { privateKey },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "START_SESSION": {
      const { secure, body } = msg.data
      if (secure !== true) {
        throw Error("session can only be started with encryption")
      }
      const { plaintext } = await compactDecrypt(body, privateKey)
      const sessionPassword = arrayBufferToString(plaintext)
      const result = await wallet.startAlephiumSession(
        "alephium-wallet-name",
        sessionPassword,
      )

      if (result) {
        const selectedAddress = await wallet.getAlephiumSelectedAddresses()
        return sendToTabAndUi({
          type: "START_SESSION_RES",
          data: selectedAddress,
        })
      }
      return sendToTabAndUi({ type: "START_SESSION_REJ" })
    }

    case "CHECK_PASSWORD": {
      const { body } = msg.data
      const { plaintext } = await compactDecrypt(body, privateKey)
      const password = arrayBufferToString(plaintext)
      if (wallet.checkPassword(password)) {
        return sendToTabAndUi({ type: "CHECK_PASSWORD_RES" })
      }
      return sendToTabAndUi({ type: "CHECK_PASSWORD_REJ" })
    }

    case "HAS_SESSION": {
      return sendToTabAndUi({
        type: "HAS_SESSION_RES",
        data: wallet.isSessionOpen(),
      })
    }

    case "STOP_SESSION": {
      wallet.lock()
      return sendToTabAndUi({ type: "DISCONNECT_ADDRESS" })
    }

    case "IS_INITIALIZED": {
      // TODO: check if session open is a good indicator
      const initialized = wallet.isSessionOpen()
      return sendToTabAndUi({
        type: "IS_INITIALIZED_RES",
        data: { initialized },
      })
    }
  }

  throw new UnhandledMessage()
}
