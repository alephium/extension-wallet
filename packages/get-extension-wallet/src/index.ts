import type { Address } from '@alephium/web3'
import type { AlephiumWindowObject, GetAlephiumWalletOptions } from './getAlephium'
import { gaw } from './getAlephium'
import type { DisconnectOptions, EnableOptions } from './types'

export type {
  EventHandler,
  EventType,
  GetAlephiumWalletOptions,
  IGetAlephiumWallet,
  AlephiumWindowObject as AlephiumWindowObject,
  IStorageWrapper,
  ModalOptions,
  WalletProvider
} from './getAlephium'

/**
 * Get the Alephium window object.
 *
 * @deprecated Please use the connect export and the returned wallet object instead.
 * @returns {Promise<AlephiumWindowObject>}
 */
export const getAlephium = (): AlephiumWindowObject => {
  const alephium = gaw.getAlephium()

  alephium.enable = async (options?: EnableOptions): Promise<Address> => {
    const wallet = await connect({ showList: options?.showModal })
    return wallet?.enable(options)
  }

  return alephium
}

/**
 * Connect to a Alephium wallet.
 *
 * @param {GetAlephiumWalletOptions} [options]
 * @returns {Promise<AlephiumWindowObject>}
 */
export const connect = (options?: GetAlephiumWalletOptions): Promise<AlephiumWindowObject | undefined> => {
  return gaw.connect({
    order: ['alephium'],
    ...options
  })
}

/**
 * Disconnect to a Alephium wallet.
 *
 * @param {DisconnectOptions} [options]
 * @returns {boolean}
 */
export const disconnect = (options?: DisconnectOptions): boolean => {
  return gaw.disconnect(options)
}
