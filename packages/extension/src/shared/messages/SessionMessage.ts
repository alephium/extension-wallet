import { WalletAccount } from "../wallet.model"

export type SessionMessage =
  | { type: "ALPH_STOP_SESSION" }
  | { type: "ALPH_HAS_SESSION" }
  | { type: "ALPH_HAS_SESSION_RES"; data: boolean }
  | { type: "ALPH_IS_INITIALIZED" }
  | {
      type: "ALPH_IS_INITIALIZED_RES"
      data: { initialized: boolean }
    }
  | { type: "ALPH_START_SESSION"; data: { secure: true; body: string } }
  | { type: "ALPH_START_SESSION_REJ" }
  | { type: "ALPH_START_SESSION_RES"; data?: WalletAccount }
  | { type: "ALPH_LOADING_PROGRESS"; data: number }
  | { type: "ALPH_CHECK_PASSWORD"; data: { body: string } }
  | { type: "ALPH_CHECK_PASSWORD_REJ" }
  | { type: "ALPH_CHECK_PASSWORD_RES" }
