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

window.addEventListener(
  "message",
  async ({ data }: MessageEvent<WindowMessageType>) => {
    const { alephiumProviders } = window
    const alephium = alephiumProviders?.alephium

    if (!alephium) {
      return
    }

    if (data.type === "DISCONNECT_ACCOUNT") {
      await alephium.disconnect()
    }
  },
)
