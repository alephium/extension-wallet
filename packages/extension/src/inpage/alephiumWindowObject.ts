import { assertNever } from "./../ui/services/assertNever"
import { WindowMessageType } from "../shared/messages"
import {
  AccountChangeEventHandler,
  AlephiumWindowObject,
  NetworkChangeEventHandler,
  WalletEvents,
} from "./inpage.model"
import { sendMessage, waitForMessage } from "./messageActions"

export const userEventHandlers: WalletEvents[] = []

export const alephiumWindowObject: AlephiumWindowObject = {
  id: "alephium",
  selectedAddress: undefined,
  chainId: undefined,
  isConnected: false,
  enable: () =>
    new Promise((resolve) => {
      const handleMessage = ({ data }: MessageEvent<WindowMessageType>) => {
        const { alephium } = window
        if (!alephium) {
          return
        }

        if (
          (data.type === "CONNECT_DAPP_RES" && data.data) ||
          (data.type === "START_SESSION_RES" && data.data)
        ) {
          window.removeEventListener("message", handleMessage)
          const { address } = data.data
          alephium.selectedAddress = address
          alephium.isConnected = true
          resolve([address])
        }
      }
      window.addEventListener("message", handleMessage)

      sendMessage({
        type: "CONNECT_DAPP",
        data: { host: window.location.host },
      })
    }),
  isPreauthorized: async () => {
    sendMessage({
      type: "IS_PREAUTHORIZED",
      data: window.location.host,
    })
    return waitForMessage("IS_PREAUTHORIZED_RES", 1000)
  },
  on: (event, handleEvent) => {
    if (event === "accountsChanged") {
      userEventHandlers.push({
        type: event,
        handler: handleEvent as AccountChangeEventHandler,
      })
    } else if (event === "networkChanged") {
      userEventHandlers.push({
        type: event,
        handler: handleEvent as NetworkChangeEventHandler,
      })
    } else {
      assertNever(event)
      throw new Error(`Unknwown event: ${event}`)
    }
  },
  off: (event, handleEvent) => {
    if (event !== "accountsChanged" && event !== "networkChanged") {
      assertNever(event)
      throw new Error(`Unknwown event: ${event}`)
    }

    const eventIndex = userEventHandlers.findIndex(
      (userEvent) =>
        userEvent.type === event && userEvent.handler === handleEvent,
    )

    if (eventIndex >= 0) {
      userEventHandlers.splice(eventIndex, 1)
    }
  },
}
