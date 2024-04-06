import { Token } from "../token/type"

export type TokenMessage =
  // - used by dapps to request tokens
  | { type: "ALPH_REQUEST_ADD_TOKEN"; data: Token }
  | { type: "REQUEST_ADD_TOKEN_RES"; data: { actionHash?: string } } // returns no actionHash if the token already exists
  | { type: "REJECT_REQUEST_ADD_TOKEN"; data: { actionHash: string } }
  | { type: "APPROVE_REQUEST_ADD_TOKEN"; data: { actionHash: string } }
