import { compactDecrypt } from "jose"
import { encode } from "starknet"

import { SessionMessage } from "../shared/messages/SessionMessage"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleSessionMessage: HandleMessage<SessionMessage> = async ({
  msg,
  background: { wallet },
  messagingKeys: { privateKey },
  respond,
}) => {
  switch (msg.type) {
    case "ALPH_START_SESSION": {
      const { secure, body } = msg.data
      if (secure !== true) {
        throw Error("session can only be started with encryption")
      }
      const { plaintext } = await compactDecrypt(body, privateKey)
      const sessionPassword = encode.arrayBufferToString(plaintext)
      const result = await wallet.startAlephiumSession(sessionPassword)

      if (result) {
        const selectedAccount = await wallet.getAlephiumSelectedAddress()
        return respond({
          type: "ALPH_START_SESSION_RES",
          data: selectedAccount,
        })
      }
      return respond({ type: "ALPH_START_SESSION_REJ" })
    }

    case "ALPH_CHECK_PASSWORD": {
      const { body } = msg.data
      const { plaintext } = await compactDecrypt(body, privateKey)
      const password = encode.arrayBufferToString(plaintext)
      if (await wallet.checkPassword(password)) {
        return sendMessageToUi({ type: "ALPH_CHECK_PASSWORD_RES" })
      }
      return sendMessageToUi({ type: "ALPH_CHECK_PASSWORD_REJ" })
    }

    case "ALPH_HAS_SESSION": {
      return respond({
        type: "ALPH_HAS_SESSION_RES",
        data: await wallet.isSessionOpen(),
      })
    }

    case "ALPH_STOP_SESSION": {
      await wallet.lock()
      return respond({ type: "ALPH_DISCONNECT_ACCOUNT" })
    }

    case "ALPH_IS_INITIALIZED": {
      const initialized = await wallet.isInitialized()
      return respond({
        type: "ALPH_IS_INITIALIZED_RES",
        data: { initialized },
      })
    }
  }

  throw new UnhandledMessage()
}
