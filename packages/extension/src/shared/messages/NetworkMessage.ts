import { Network, NetworkStatus } from '../networks'

export type NetworkMessage =
  // ***** networks *****
  | { type: 'GET_CUSTOM_NETWORKS' }
  | { type: 'GET_CUSTOM_NETWORKS_RES'; data: Network[] }
  | { type: 'ADD_CUSTOM_NETWORKS'; data: Network[] }
  | { type: 'ADD_CUSTOM_NETWORKS_RES'; data: Network[] }
  | { type: 'REMOVE_CUSTOM_NETWORKS'; data: Network['id'][] }
  | { type: 'REMOVE_CUSTOM_NETWORKS_RES'; data: Network[] }
  | { type: 'GET_NETWORK_STATUSES' }
  | {
      type: 'GET_NETWORK_STATUSES_RES'
      data: NetworkStatus[]
    }
  | { type: 'SET_CURRENT_NETWORK'; data: { networkId: string } }
  | { type: 'SET_CURRENT_NETWORK_RES'; data: { networkId: string } }
  | { type: 'GET_CURRENT_NETWORK' }
  | { type: 'GET_CURRENT_NETWORK_RES'; data: { network: Network } }
  | { type: 'GET_CUSTOM_NETWORKS_RES'; data: Network[] }
  // - used by dapps to request addition of custom network
  | { type: 'REQUEST_ADD_CUSTOM_NETWORK'; data: Network }
  | { type: 'REQUEST_ADD_CUSTOM_NETWORK_RES'; data: { actionHash?: string } }
  | { type: 'REJECT_REQUEST_ADD_CUSTOM_NETWORK'; data: { actionHash: string } }
  | { type: 'APPROVE_REQUEST_ADD_CUSTOM_NETWORK'; data: { actionHash: string } }

  // - used by dapps to request switching of already added custom network
  | {
      type: 'REQUEST_SWITCH_CUSTOM_NETWORK'
      data: { id: Network['id'] }
    }
  | { type: 'REQUEST_SWITCH_CUSTOM_NETWORK_RES'; data: { actionHash?: string } }
  | {
      type: 'REJECT_REQUEST_SWITCH_CUSTOM_NETWORK'
      data: { actionHash: string }
    }
  | {
      type: 'APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK'
      data: { actionHash: string }
    }
