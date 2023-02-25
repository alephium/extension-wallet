import type { WindowMessageType } from "../shared/messages"
import { disconnectAccount } from "./account"
import { alephiumWindowObject, userEventHandlers } from "./alephiumWindowObject"
import { sendMessage, waitForMessage } from "./messageActions"
import { getIsPreauthorized } from "./messaging"
import { isPlainObject } from "lodash-es"

const INJECT_NAMES = ["alephium"]

function attach() {
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
  })
}

function attachHandler() {
  attach()
  setTimeout(attach, 100)
}
// inject script
attachHandler()
window.addEventListener("load", () => attachHandler())
document.addEventListener("DOMContentLoaded", () => attachHandler())
document.addEventListener("readystatechange", () => attachHandler())

window.addEventListener(
  "message",
  async ({ data }: MessageEvent<WindowMessageType>) => {
    const { alephiumProviders } = window
    const alephium = alephiumProviders?.alephium

    if (!alephium) {
      return
    }

    if (
      data.type === "CONNECT_ACCOUNT_RES" ||
      data.type === "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK"
    ) {
      const account =
        data.type === "CONNECT_ACCOUNT_RES"
          ? data.data
          : data.data.selectedAccount

      const isPreauthorized = await getIsPreauthorized()
      if (!isPreauthorized) {
        // disconnect so the user can see they are no longer connected
        // TODO: better UX would be to also re-connect when user selects pre-authorized account
        await disconnectAccount()
      } else {
        const walletAccountP = waitForMessage(
          "CONNECT_DAPP_RES",
          10 * 60 * 1000,
        )
        sendMessage({
          type: "CONNECT_DAPP",
          data: { host: window.location.host },
        })
        const walletAccount = await walletAccountP

        if (!walletAccount) {
          return disconnectAccount()
        }

        if (
          account &&
          (account.address !== alephium.connectedAccount?.address ||
            account.networkId !== alephium.connectedNetworkId) &&
          alephium.onDisconnected !== undefined
        ) {
          await alephium.onDisconnected()
        }
      }
    } else if (data.type === "DISCONNECT_ACCOUNT") {
      if (alephium.onDisconnected !== undefined) {
        await alephium.onDisconnected()
      }
    }
  },
)
