import type { JWK } from "jose"

export type MiscenalleousMessage =
  | { type: "ALPH_OPEN_UI" }
  | { type: "ALPH_RESET_ALL" }
  | { type: "ALPH_GET_MESSAGING_PUBLIC_KEY" }
  | { type: "ALPH_GET_MESSAGING_PUBLIC_KEY_RES"; data: JWK }
