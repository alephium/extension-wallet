export type RecoveryMessage =
  | { type: "ALPH_RECOVER_BACKUP"; data: string }
  | { type: "ALPH_RECOVER_BACKUP_RES" }
  | { type: "ALPH_RECOVER_BACKUP_REJ"; data: string }
  | { type: "ALPH_RECOVER_SEEDPHRASE"; data: { secure: true; body: string } }
  | { type: "ALPH_RECOVER_SEEDPHRASE_RES" }
  | { type: "ALPH_RECOVER_SEEDPHRASE_REJ" }
  | { type: "ALPH_DOWNLOAD_BACKUP_FILE" }
  | { type: "ALPH_DOWNLOAD_BACKUP_FILE_RES" }
