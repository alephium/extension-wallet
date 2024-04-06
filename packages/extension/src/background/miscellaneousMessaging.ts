import browser from "webextension-polyfill"

import { MiscenalleousMessage as MiscellaneousMessage } from "../shared/messages/MiscellaneousMessage"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"

export const handleMiscellaneousMessage: HandleMessage<
  MiscellaneousMessage
> = async ({ msg, messagingKeys: { publicKeyJwk }, respond }) => {
  switch (msg.type) {
    case "ALPH_OPEN_UI": {
      return openUi()
    }

    case "ALPH_RESET_ALL": {
      try {
        browser.storage.local.clear()
        browser.storage.sync.clear()
        browser.storage.managed.clear()
        browser.storage.session.clear()
      } catch {
        // Ignore browser.storage.session error "This is a read-only store"
      }
      return respond({ type: "ALPH_DISCONNECT_ACCOUNT" })
    }

    case "ALPH_GET_MESSAGING_PUBLIC_KEY": {
      return sendMessageToUi({
        type: "ALPH_GET_MESSAGING_PUBLIC_KEY_RES",
        data: publicKeyJwk,
      })
    }
  }

  throw new UnhandledMessage()
}
