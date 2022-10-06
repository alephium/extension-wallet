export type RecoveryMessage =
  | { type: 'RECOVER_SEEDPHRASE'; data: { secure: true; body: string } }
  | { type: 'RECOVER_SEEDPHRASE_RES' }
  | { type: 'RECOVER_SEEDPHRASE_REJ' }
