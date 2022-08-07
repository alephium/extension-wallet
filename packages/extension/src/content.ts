import browser from "webextension-polyfill"

import { WindowMessageType } from "./shared/messages"
import { messageStream, sendMessage } from "./shared/messages"

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js")
const alephiumExtensionId = browser.runtime.id
script.id = "alephium-extension"
script.setAttribute("data-extension-id", alephiumExtensionId)

container.insertBefore(script, container.children[0])

window.addEventListener(
  "message",
  function (event: MessageEvent<WindowMessageType>) {
    // forward messages which were not forwarded before and belong to the extension
    if (
      !event.data?.forwarded &&
      event.data?.extensionId === alephiumExtensionId
    ) {
      sendMessage({ ...event.data })
    }
  },
)
messageStream.subscribe(([msg]) => {
  window.postMessage(
    { ...msg, forwarded: true, extensionId: alephiumExtensionId },
    window.location.origin,
  )
})
