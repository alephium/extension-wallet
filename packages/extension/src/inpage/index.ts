import { assertNever } from "./../ui/services/assertNever"
import { WindowMessageType } from "../shared/messages"
import { alephiumWindowObject, userEventHandlers } from "./alephiumWindowObject"

function attach() {
  try {
    delete window.alephium
    // set read only property to window
    Object.defineProperty(window, "alephium", {
      value: alephiumWindowObject,
      writable: false,
    })
  } catch {
    // ignore
  }
  // we need 2 different try catch blocks because we want to execute both even if one of them fails
  try {
    window.alephium = alephiumWindowObject
  } catch {
    // ignore
  }
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
  ({ data }: MessageEvent<WindowMessageType>) => {
    const { alephium } = window
    if (!alephium) {
      return
    }
    if (data.type === "CONNECT_ADDRESS") {
      const { address } = data.data
      if (address !== alephium.selectedAddress) {
        alephium.selectedAddress = address
        for (const userEvent of userEventHandlers) {
          if (userEvent.type === "addressesChanged") {
            userEvent.handler([address])
          } else if (userEvent.type === "networkChanged") {
            console.log("network changed")
          } else {
            assertNever(userEvent)
          }
        }
      }
    } else if (data.type === "DISCONNECT_ADDRESS") {
      alephium.selectedAddress = undefined
      alephium.isConnected = false
      for (const userEvent of userEventHandlers) {
        if (userEvent.type === "addressesChanged") {
          userEvent.handler([])
        } else if (userEvent.type === "networkChanged") {
          userEvent.handler(undefined)
        } else {
          assertNever(userEvent)
        }
      }
    }
  },
)
