import type {
  GetAlephiumWalletOptions,
  IAlephiumWindowObject,
} from "./getAlephium"
import { gaw } from "./getAlephium"

export type {
  EventHandler,
  EventType,
  GetAlephiumWalletOptions,
  IGetAlephiumWallet,
  IAlephiumWindowObject,
  IStorageWrapper,
  ModalOptions,
  WalletProvider,
} from "./getAlephium"

/**
 * Get the Alephium window object.
 *
 * @deprecated Please use the connect export and the returned wallet object instead.
 * @returns {Promise<IAlephiumWindowObject>}
 */
export const getAlephium = (): IAlephiumWindowObject => {
  const alephium = gaw.getAlephium()

  alephium.enable = async (options?: {
    showModal?: boolean
  }): Promise<string[]> => {
    const wallet = await connect({ showList: options?.showModal })
    return wallet?.enable(options) || []
  }

  return alephium
}

/**
 * Connect to a Alephium wallet.
 *
 * @param {GetAlephiumWalletOptions} [options]
 * @returns {Promise<IAlephiumWindowObject>}
 */
export const connect = (
  options?: GetAlephiumWalletOptions,
): Promise<IAlephiumWindowObject | undefined> => {
  return gaw.connect({
    order: ["alephium"],
    ...options,
  })
}
