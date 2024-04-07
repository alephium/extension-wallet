import { Network, NetworkStatus } from "../network"
import { WalletAccount } from "../wallet.model"

export type NetworkMessage =
  // ***** networks *****
  | { type: "ALPH_GET_NETWORKS" }
  | { type: "ALPH_GET_NETWORKS_RES"; data: Network[] }
  | { type: "ALPH_GET_NETWORK"; data: Network["id"] }
  | { type: "ALPH_GET_NETWORK_RES"; data: Network }
  | { type: "ALPH_GET_CUSTOM_NETWORKS" }
  | { type: "ALPH_GET_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "ALPH_ADD_CUSTOM_NETWORKS"; data: Network[] }
  | { type: "ALPH_ADD_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "ALPH_REMOVE_CUSTOM_NETWORKS"; data: Network["id"][] }
  | { type: "ALPH_REMOVE_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "ALPH_GET_NETWORK_STATUSES"; data?: Network[] } // allows ui to get specific network statuses and defaults to all
  | {
      type: "ALPH_GET_NETWORK_STATUSES_RES"
      data: Partial<Record<Network["id"], NetworkStatus>>
    }

  // - used by dapps to request addition of custom network
  | { type: "ALPH_REQUEST_ADD_CUSTOM_NETWORK"; data: Network }
  | { type: "ALPH_REQUEST_ADD_CUSTOM_NETWORK_RES"; data: { actionHash: string } }
  | {
      type: "ALPH_REQUEST_ADD_CUSTOM_NETWORK_REJ"
      data: { error: string }
    }
  | { type: "ALPH_REJECT_REQUEST_ADD_CUSTOM_NETWORK"; data: { actionHash: string } }
  | { type: "ALPH_APPROVE_REQUEST_ADD_CUSTOM_NETWORK"; data: { actionHash: string } }

  // - used by dapps to request switching of already added custom network
  | {
      type: "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { id: Network["id"] }
    }
  | { type: "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK_RES"; data: { actionHash: string } }
  | {
      type: "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK_REJ"
      data: { error: string }
    }
  | {
      type: "ALPH_REJECT_REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { actionHash: string }
    }
  | {
      type: "ALPH_APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { actionHash: string; selectedAccount: WalletAccount }
    }
