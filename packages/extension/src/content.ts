import browser from "webextension-polyfill"

import { WindowMessageType } from "./shared/messages"
import { messageStream, sendMessage } from "./shared/messages"

const container = document.head || document.documentElement
const alephiumExtensionId = browser.runtime.id

let tag: HTMLElement
if (browser.runtime.getManifest().manifest_version === 3) {
  const divTag = document.createElement("div")
  divTag.style.display = 'none'
  tag = divTag
} else {
  const scriptTag = document.createElement("script")
  scriptTag.src = browser.runtime.getURL("inpage.js")
  tag = scriptTag
}
tag.id = 'alephium-extension'
tag.setAttribute('data-extension-id', alephiumExtensionId)
container.insertBefore(tag, container.children[0])

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
