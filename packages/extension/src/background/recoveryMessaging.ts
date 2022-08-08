import { compactDecrypt } from "jose"

import { RecoveryMessage } from "../shared/messages/RecoveryMessage"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { arrayBufferToString } from "./utils/encode"

export const handleRecoveryMessage: HandleMessage<RecoveryMessage> = async ({
  msg,
  messagingKeys: { privateKey },
  background: { wallet },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "RECOVER_SEEDPHRASE": {
      try {
        const { secure, body } = msg.data
        if (secure !== true) {
          throw Error("session can only be started with encryption")
        }
        const { plaintext } = await compactDecrypt(body, privateKey)
        const {
          seedPhrase,
          newPassword,
        }: {
          seedPhrase: string
          newPassword: string
        } = JSON.parse(arrayBufferToString(plaintext))

        await wallet.restoreSeedPhrase(seedPhrase, newPassword)
        return sendToTabAndUi({ type: "RECOVER_SEEDPHRASE_RES" })
      } catch (error) {
        console.error(error)
        return sendToTabAndUi({ type: "RECOVER_SEEDPHRASE_REJ" })
      }
    }
  }

  throw new UnhandledMessage()
}
