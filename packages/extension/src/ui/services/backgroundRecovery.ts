import { sendMessage, waitForMessage } from "../../shared/messages"
import { encryptForBackground } from "./crypto"

export const recoverBySeedPhrase = async (
  seedPhrase: string,
  newPassword: string,
): Promise<void> => {
  const message = JSON.stringify({ seedPhrase, newPassword })
  const body = await encryptForBackground(message)

  sendMessage({
    type: "RECOVER_SEEDPHRASE",
    data: { secure: true, body },
  })

  const succeeded = await Promise.race([
    waitForMessage("RECOVER_SEEDPHRASE_RES").then(() => true),
    waitForMessage("RECOVER_SEEDPHRASE_REJ")
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) {
    throw Error("Invalid Seed Phrase")
  }
}
