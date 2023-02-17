import type { Account, InteractiveSignerProvider, EnableOptionsBase, Address } from '@alephium/web3'

export interface IStorageWrapper {
  set(value: string | null | undefined): boolean
  get(): string | null | undefined
  delete(): boolean
}

export type ModalOptions = {
  theme?: 'light' | 'dark'
}

export type DisconnectOptions = {
  /**
   * if true - will reset last-wallet state
   */
  clearLastWallet?: boolean
  /**
   * if true = will reset default-wallet state
   */
  clearDefaultWallet?: boolean
}

export type Order = string[] | 'community' | 'random' | null | undefined

export type GetAlephiumWalletOptions = {
  /**
   * control wallets order for both "connect to a wallet" and
   * "install a wallet" lists.
   *
   * `array` - set higher + ordered priority to specific wallets by
   * passing an array of wallet ids (just the wallets you would like to
   * promote, other wallets will still be listed in random order)
   *
   * `"community"` - community set order, listed in the wallet-discovery manifest
   *
   * `"random"` - each time the list shows with a different order
   *
   * default is "random"
   */
  order?: Order
  /**
   * list of wallets to include on both "connect to a wallet" and "install a wallet" lists,
   * default is to include all wallets
   */
  include?: string[]
  /**
   * list of wallets to exclude from both "connect to a wallet" and "install a wallet" lists
   * default is not to exclude any wallet
   */
  exclude?: string[]
  /**
   * force-showing the list of wallets, regardless of any default settings
   * and/or pre-authorization state of one of the wallets.
   * default is `false` when disconnected from a wallet,
   * and `true` when already connected to a wallet.
   */
  showList?: boolean
  modalOptions?: ModalOptions
}

export interface IGetAlephiumWallet {
  /**
   * connect to a wallet
   *
   * when disconnected -
   *  - if there is one pre-authorized wallet:
   *      connect to it automatically
   *  - if there are multiple pre-authorized wallets and a default wallet:
   *      connect to it automatically
   *  - if there are multiple pre-authorized wallets and no default wallet:
   *      show them first in the list, ordered by last connect
   *      (where "last connect" stands for the timestamp when the user
   *      have chosen to connect to that wallet via the list)
   *  - if there are no pre-authorized wallets:
   *      show all wallets by dapp chosen order (default to random),
   *      installed wallets first, then other available wallets below
   *
   * when connected -
   *  - show the "connect to a wallet" list
   *      1. display all available wallets respectively to the previously given options
   *      2. allow users to disconnect the current wallet
   *      3. modify default wallet settings
   *
   * @param options
   * @returns Promise of `AlephiumWindowObject` if the user have chosen a
   * wallet from the list, undefined when the list got closed without choosing
   * a wallet (i.e. the user simply canceled the "connect to a wallet" request,
   * or chose to install a wallet from the wallets-discovery list).
   *
   * Once connected to a wallet, clients can retrieve the wallet's
   * `AlephiumWindowObject` instance by calling `getAlephium()`
   */
  connect(options?: GetAlephiumWalletOptions): Promise<AlephiumWindowObject | undefined>

  /**
   * disconnect from a wallet
   * @param options
   */
  disconnect(options?: DisconnectOptions): boolean

  /**
   * returns a list of browser-installed wallets (as opposed to browser-available wallets)
   * @param options see `connect` `options` for `order`, `include` & `exclude`
   */
  getInstalledWallets(
    options?: Omit<GetAlephiumWalletOptions, 'showList' | 'modalOptions'>
  ): Promise<AlephiumWindowObject[]>

  /**
   * return last-chosen wallet `AlephiumWindowObject` instance,
   * or default wrapper if disconnected
   */
  getAlephium(): AlephiumWindowObject
}

export type EventType = 'addressesChanged' | 'networkChanged'

export type EventHandler = (data: any) => Promise<void> | void

export type EnableOptions = EnableOptionsBase & {
  showModal?: boolean
}

export interface AlephiumWindowObject extends InteractiveSignerProvider<EnableOptions> {
  enable: (options?: EnableOptions) => Promise<Address>
  isPreauthorized: () => Promise<boolean>
  on: (event: EventType, handleEvent: EventHandler) => void
  off: (event: EventType, handleEvent: EventHandler) => void

  disconnect: () => Promise<void>
  id: string
  name: string
  icon: string
  connectedAddress?: string
  connectedNetworkId?: string
}

export type WalletProvider = {
  id: string
  name: string
  icon: string
  downloads:
  | { chrome?: `https://chrome.google.com/webstore/detail/${string}` }
  | { firefox?: `https://addons.mozilla.org/en-US/firefox/addon/${string}` }
}

declare global {
  interface Window {
    gsw: boolean
  }
}
