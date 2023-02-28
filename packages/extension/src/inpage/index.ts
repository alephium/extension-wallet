import type { WindowMessageType } from "../shared/messages"
import { alephiumWindowObject } from "./alephiumWindowObject"
import { isPlainObject } from "lodash-es"
import { nostrObject } from "./nostrObject"
import { providerInitializedEvent } from "@alephium/get-extension-wallet"

const INJECT_NAMES = ["alephium"]

function attachAlephiumProvider() {
  window.alephiumProviders =
    window.alephiumProviders && isPlainObject(window.alephiumProviders) ? window.alephiumProviders : {}

  INJECT_NAMES.forEach((name) => {
    // we need 2 different try catch blocks because we want to execute both even if one of them fails
    try {
      delete (window.alephiumProviders as any)[name]
    } catch (e) {
      // ignore
    }
    try {
      // set read only property to window
      Object.defineProperty(window.alephiumProviders, name, {
        value: alephiumWindowObject,
        writable: false,
      })
    } catch {
      // ignore
    }
    try {
      ; (window.alephiumProviders as any)[name] = alephiumWindowObject
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(providerInitializedEvent('alephium')))
  })
}

function attachNostrProvider() {
  try {
    // set read only property to window
    Object.defineProperty(window.nostr, 'nostr', {
      value: nostrObject,
      writable: false,
    })
  } catch {
    // ignore
  }
  try {
    ; (window as any)['nostr'] = nostrObject
  } catch {
    // ignore
  }
}

function attach() {
  attachAlephiumProvider()
  attachNostrProvider()
}
// inject script
attach()

// TODO: check if this listener is necessary
window.addEventListener(
  "message",
  async ({ data }: MessageEvent<WindowMessageType>) => {
    // const { alephiumProviders } = window
    // const alephium = alephiumProviders?.alephium

    // if (!alephium) {
    //   return
    // }

    // if (
    //   data.type === "CONNECT_ACCOUNT_RES" ||
    //   data.type === "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK"
    // ) {
    //   const account =
    //     data.type === "CONNECT_ACCOUNT_RES"
    //       ? data.data
    //       : data.data.selectedAccount

    //   const isPreauthorized = await getIsPreauthorized()
    //   if (!isPreauthorized) {
    //     // disconnect so the user can see they are no longer connected
    //     // TODO: better UX would be to also re-connect when user selects pre-authorized account
    //     await disconnectAccount()
    //   } else {
    //     const walletAccountP = waitForMessage(
    //       "CONNECT_DAPP_RES",
    //       10 * 60 * 1000,
    //     )
    //     sendMessage({
    //       type: "CONNECT_DAPP",
    //       data: { host: window.location.host },
    //     })
    //     const walletAccount = await walletAccountP

    //     if (!walletAccount) {
    //       return disconnectAccount()
    //     }

    //     if (
    //       account &&
    //       (account.address !== alephium.connectedAccount?.address ||
    //         account.networkId !== alephium.connectedNetworkId)
    //     ) {
    //       await alephium.disconnect()
    //     }
    //   }
    // } else if (data.type === "DISCONNECT_ACCOUNT") {
    //   await alephium.disconnect()
    // }
  },
)
