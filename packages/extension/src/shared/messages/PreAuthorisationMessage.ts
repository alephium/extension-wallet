import { AddressAndPublicKey } from '../addresses'

export type PreAuthorisationMessage =
  | { type: 'CONNECT_DAPP'; data: { host: string } }
  | { type: 'CONNECT_DAPP_RES'; data: AddressAndPublicKey }
  | { type: 'PREAUTHORIZE'; data: string }
  | {
    type: 'REJECT_PREAUTHORIZATION'
    data: { host: string; actionHash: string }
  }
  | { type: 'REMOVE_PREAUTHORIZATION'; data: string }
  | { type: 'REMOVE_PREAUTHORIZATION_RES' }
  | { type: 'IS_PREAUTHORIZED'; data: string }
  | { type: 'IS_PREAUTHORIZED_RES'; data: boolean }
  | { type: 'RESET_PREAUTHORIZATIONS' }
