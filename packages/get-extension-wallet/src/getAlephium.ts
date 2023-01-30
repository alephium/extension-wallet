import type {
  Account,
  Address,
  ExtSignDeployContractTxParams,
  ExtSignExecuteScriptTxParams,
  ExtSignMessageParams,
  ExtSignTransferTxParams,
  ExtSignUnsignedTxParams,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from '@alephium/web3'
import { isPlainObject } from 'lodash-es'

import defaultWallet from './configs/defaultWallet'
import lastWallet from './configs/lastConnected'
import show from './modal'
import type {
  AlephiumWindowObject,
  DisconnectOptions,
  EventHandler,
  EventType,
  GetAlephiumWalletOptions,
  IGetAlephiumWallet,
  EnableOptions
} from './types'
import { filterBy, filterPreAuthorized, isWalletObj, shuffle, sortBy } from './utils'

class GetAlephiumWallet implements IGetAlephiumWallet {
  #walletObjRef: { current?: AlephiumWindowObject } = {}

  connect = async (options?: GetAlephiumWalletOptions): Promise<AlephiumWindowObject | undefined> => {
    try {
      this.#declare()

      const connected = this.#isConnected()

      const {
        installed: installedWallets,
        preAuthorized,
        defaultWallet,
        lastWallet
      } = await this.#getInstalledWallets(options)

      // explicitly attempting to connect without showing the list,
      // return first preAuthorized wallet (if any);
      // note: preAuthorized wallets - at this point - are already
      // ordered by -
      // 0. defaultWallet
      // 1. lastWallet
      // 2-n. others (shuffled)
      if (options?.showList === false) {
        const wallet = preAuthorized[0]
        // do not override `lastWallet` state if its associated wallet
        // is not preAuthorized (i.e. user could choose a wallet, but
        // not necessarily approve it for connection)
        console.log(`silent connect requested -> wallet: ${wallet?.id}`)
        return wallet ? this.#setCurrentWallet(wallet) : undefined
      }

      // force showing the popup if
      // 1. we are called while connected
      // 2. we were explicitly told to show it
      // 3. user never selected from the popup
      const forcePopup = connected || options?.showList || !lastWallet
      if (!forcePopup) {
        // return user-set default wallet if available
        for (const stateWallet of [
          // 1st priority is user-set-default wallet
          defaultWallet,
          // 2nd priority is user-last-selected wallet
          lastWallet
        ] as AlephiumWindowObject[]) {
          if (stateWallet) {
            return this.#setCurrentWallet(stateWallet)
          }
        }

        // no state-wallet but only one wallet - returning that wallet
        if (installedWallets.length === 1) {
          return this.#setCurrentWallet(installedWallets[0])
        }
      }

      // show popup
      const wallet = await show(installedWallets, options)
      return this.#setCurrentWallet(wallet)
    } catch (err) {
      console.error(err)
    }
    return undefined
  }

  constructor() {
    this.#declare()
  }

  disconnect = (options?: DisconnectOptions): boolean => {
    this.#declare()

    const connected = this.#isConnected()
    this.#walletObjRef.current = undefined

    if (options?.clearLastWallet) lastWallet.delete()
    if (options?.clearDefaultWallet) defaultWallet.delete()

    // disconnected successfully if was connected before
    return connected
  }

  getAlephium = (): AlephiumWindowObject => {
    this.#declare()
    const self = this

    return (
      this.#walletObjRef.current ??
      // create a wrapper
      new (class implements AlephiumWindowObject {
        discriminator = '___AlephiumWindowObject___'
        // default values
        id = 'disconnected'
        name = 'Disconnected'
        icon = ''
        connectedAddress?: string = undefined
        disconnect = () => Promise.resolve() // TODO: FIXME
        /**
         * stores pre-enabled wallet `on` calls' listeners
         * @private
         */
        #callbacks: { [key: string]: EventHandler[] } = {}

        /**
         * attempt to read a chosen wallet before calling `connect`
         * ourselves; a valid chosen wallet will be presented when
         * the user holds a reference to getAlephium()'s returned
         * wallet-wrapper object, and keep accessing it even after
         * connecting a wallet successfully
         * @param options
         */
        enable = async (options?: EnableOptions): Promise<Address> => {
          try {
            const wallet = await this.#connect({
              showList: options?.showModal
            })
            if (wallet) {
              const result: Address = await wallet.enable(options)
              this.#refreshWalletProperties(wallet)
              return result
            }
          } catch (err) {
            console.error(err)
          }
        }

        #call = async <T>(methodName: string, method: (obj: AlephiumWindowObject) => Promise<T>): Promise<T> => {
          const currentWallet = self.#walletObjRef.current
          if (!currentWallet) {
            throw new Error(`can't ${methodName} with a disconnected wallet`)
          }
          return await method(currentWallet)
        }

        signAndSubmitTransferTx = async (params: ExtSignTransferTxParams): Promise<SignTransferTxResult> => {
          return await this.#call('signAndSubmitTransferTx', (wallet) => wallet.signAndSubmitTransferTx(params))
        }

        signAndSubmitDeployContractTx = async (
          params: ExtSignDeployContractTxParams
        ): Promise<SignDeployContractTxResult> => {
          return await this.#call('signAndSubmitDeployContractTx', (wallet) =>
            wallet.signAndSubmitDeployContractTx(params)
          )
        }

        signAndSubmitExecuteScriptTx = async (
          params: ExtSignExecuteScriptTxParams
        ): Promise<SignExecuteScriptTxResult> => {
          return await this.#call('signAndSubmitExecuteScriptTx', (wallet) =>
            wallet.signAndSubmitExecuteScriptTx(params)
          )
        }

        signUnsignedTx = async (params: ExtSignUnsignedTxParams): Promise<SignUnsignedTxResult> => {
          return await this.#call('signUnsignedTx', (wallet) => wallet.signUnsignedTx(params))
        }

        signAndSubmitUnsignedTx = async (params: ExtSignUnsignedTxParams): Promise<SignUnsignedTxResult> => {
          return await this.#call('signAndSubmitUnsignedTx', (wallet) => wallet.signAndSubmitUnsignedTx(params))
        }

        signMessage = async (params: ExtSignMessageParams): Promise<SignMessageResult> => {
          return await this.#call('signMessage', (wallet) => wallet.signMessage(params))
        }

        nodeProvider = (() => {
          const provider = self.#walletObjRef.current.nodeProvider
          if (provider) {
            return provider
          } else {
            throw new Error('Node provider not found')
          }
        })()

        explorerProvider = (() => {
          const provider = self.#walletObjRef.current.explorerProvider
          if (provider) {
            return provider
          } else {
            throw new Error('Explorer provider not found')
          }
        })()

        /**
         * @return true when there is at least 1 pre-authorized wallet
         */
        isPreauthorized = () =>
          self.#isConnected()
            ? (self.#walletObjRef.current as AlephiumWindowObject).isPreauthorized()
            : self.#getInstalledWallets().then((result) => !!result.preAuthorized.length)

        off = (event: EventType, handleEvent: EventHandler) => {
          if (self.#isConnected()) {
            self.#walletObjRef.current?.off(event, handleEvent)
          } else {
            if (this.#callbacks[event]) {
              this.#callbacks[event] = this.#callbacks[event].filter((callback) => callback !== handleEvent)
            }
          }
        }

        on = (event: EventType, handleEvent: EventHandler) => {
          if (self.#isConnected()) {
            self.#walletObjRef.current?.on(event, handleEvent)
          } else {
            const listeners = this.#callbacks[event] ?? (this.#callbacks[event] = [])
            if (!listeners.includes(handleEvent)) {
              listeners.push(handleEvent)
            }
          }
        }

        getSelectedAddress = async () => {
          return Promise.resolve(this.connectedAddress)
        }

        #connect = (options?: GetAlephiumWalletOptions) =>
          (self.#walletObjRef.current ? Promise.resolve(self.#walletObjRef.current) : self.connect(options)).then(
            (wallet) => {
              if (wallet) {
                // assign wallet data to the wallet-wrapper instance
                // in case the user holds it and call it directly
                // instead of getting a fresh reference each time
                // via gsw.getAlephium()
                this.id = wallet.id
                this.name = wallet.name
                this.icon = wallet.icon
                //this.version = wallet.version
                this.#refreshWalletProperties(wallet)

                // register pre-connect callbacks on target wallet
                Object.entries(this.#callbacks).forEach(([event, handlers]) =>
                  handlers.forEach((h) => wallet.on(event as EventType, h))
                )
                // then clear callbacks
                this.#callbacks = {}
              }
              return wallet
            }
          )

        #refreshWalletProperties = (wallet: AlephiumWindowObject | undefined) => {
          if (!wallet) return
          this.connectedAddress = wallet.connectedAddress
        }
      })()
    )
  }

  getInstalledWallets(
    options?: Omit<GetAlephiumWalletOptions, 'showList' | 'modalOptions'>
  ): Promise<AlephiumWindowObject[]> {
    return this.#getInstalledWallets(options).then((res) => res.installed)
  }

  #isConnected(): boolean {
    return !!this.#walletObjRef.current
  }

  #setCurrentWallet = (wallet: AlephiumWindowObject | undefined) => {
    this.#walletObjRef.current = wallet
    if (wallet) {
      lastWallet.set(wallet.id)
    }
    return wallet
  }

  #getInstalledWallets = async (options?: Omit<GetAlephiumWalletOptions, 'showList' | 'modalOptions'>) => {
    await this.#waitForDocumentReady()

    // lookup installed wallets
    let installed: AlephiumWindowObject[] = []

    const alephiumProviders = window['alephiumProviders']
    if (isPlainObject(alephiumProviders)) {
      installed = Object.values(
        Object.getOwnPropertyNames(alephiumProviders).reduce<Record<string, AlephiumWindowObject>>((wallets, key) => {
          const wallet = (alephiumProviders as Record<string, any>)[key]
          if (isWalletObj(key, wallet) && !wallets[wallet.id]) {
            wallets[wallet.id] = wallet
          }

          return wallets
        }, {})
      )
    }

    // 1. lookup state wallets
    // 2. remove state-set wallets if they aren't available anymore
    const defaultWalletObj = installed.find((w) => w.id === defaultWallet.get())
    if (!defaultWalletObj) defaultWallet.delete()
    const lastWalletObj = installed.find((w) => w.id === lastWallet.get())
    if (!lastWalletObj) lastWallet.delete()

    // fetch & shuffle all preAuthorized
    const preAuthorized: AlephiumWindowObject[] = shuffle(await filterPreAuthorized(installed))

    /**
     * prioritize states wallets at given arr
     */
    const prioritizeStateWallets = (arr: AlephiumWindowObject[]) => {
      // iterate last->first priorities since we push state-wallet at top
      ;[lastWalletObj, defaultWalletObj].forEach((stateWallet) => {
        if (stateWallet) {
          const filtered = arr.filter((w) => w.id !== stateWallet.id)
          const stateWalletPopped = filtered.length !== arr.length
          if (stateWalletPopped) {
            arr = [stateWallet, ...filtered]
          }
        }
      })
      return arr
    }

    const result = {
      installed: prioritizeStateWallets(installed),
      preAuthorized: prioritizeStateWallets(preAuthorized),
      defaultWallet: defaultWalletObj,
      lastWallet: lastWalletObj
    }

    result.installed = filterBy<AlephiumWindowObject>(result.installed, options)

    result.installed = sortBy<AlephiumWindowObject>(result.installed, options?.order)

    const isFixedOrder = options && Array.isArray(options.order)
    if (!isFixedOrder) {
      // 1. prioritize preAuthorized wallets:
      // remove preAuthorized wallets from installed wallets list
      const preAuthorizedIds = new Set<string>(preAuthorized.map((pa) => pa.id))
      result.installed = result.installed.filter((w) => !preAuthorizedIds.has(w.id))
      // put preAuthorized wallets first
      result.installed = [...preAuthorized, ...result.installed]

      // 2. prioritize states wallets:
      result.installed = prioritizeStateWallets(result.installed)
    }

    return result
  }

  #waitForDocumentReady = () => {
    const isReady = () => {
      const readyState = document.readyState
      return readyState === 'complete'
    }

    return new Promise<void>((resolve) => {
      if (isReady()) {
        resolve()
      } else {
        const id = setInterval(() => {
          if (isReady()) {
            clearInterval(id)
            resolve()
          }
        }, 50)
      }
    })
  }

  #declare = () => {
    if (typeof window !== 'undefined') {
      window.gsw = true
    }
  }
}

export const gaw = new GetAlephiumWallet()
export const getAlephium = gaw.getAlephium
export const connect = gaw.connect
export const disconnect = gaw.disconnect
export const getInstalledWallets = gaw.getInstalledWallets

export * from './types'
