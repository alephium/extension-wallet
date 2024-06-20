import i18n from "../../i18n"
import { sendMessage, waitForMessage } from "../../shared/messages"
import { encryptForBackground } from "./crypto"

export const recoverBackup = async (backup: string) => {
  sendMessage({ type: "ALPH_RECOVER_BACKUP", data: backup })

  await Promise.race([
    waitForMessage("ALPH_RECOVER_BACKUP_RES"),
    waitForMessage("ALPH_RECOVER_BACKUP_REJ").then((error) => {
      throw new Error(error)
    }),
  ])
}

export const recoverBySeedPhrase = async (
  seedPhrase: string,
  newPassword: string,
): Promise<void> => {
  const message = JSON.stringify({ seedPhrase, newPassword })
  const body = await encryptForBackground(message)

  sendMessage({
    type: "ALPH_RECOVER_SEEDPHRASE",
    data: { secure: true, body },
  })

  const succeeded = await Promise.race([
    waitForMessage("ALPH_RECOVER_SEEDPHRASE_RES").then(() => true),
    waitForMessage("ALPH_RECOVER_SEEDPHRASE_REJ")
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) {
    throw Error(i18n.t("Invalid Seed Phrase"))
  }
}

export const downloadBackupFile = () => {
  sendMessage({ type: "ALPH_DOWNLOAD_BACKUP_FILE" })
}

// for debugging purposes
try {
  ; (window as any).downloadBackup = downloadBackupFile
} catch {
  // ignore
}
