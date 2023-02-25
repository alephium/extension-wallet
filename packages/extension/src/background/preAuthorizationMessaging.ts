import { difference } from "lodash-es"

import { PreAuthorisationMessage } from "../shared/messages/PreAuthorisationMessage"
import { isPreAuthorized, preAuthorizeStore, removePreAuthorization } from "../shared/preAuthorizations"
import { withNetwork } from "../shared/wallet.service"
import { addTab, sendMessageToHost } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"

preAuthorizeStore.subscribe(async (_, changeSet) => {
  const removed = difference(changeSet.oldValue ?? [], changeSet.newValue ?? [])
  for (const preAuthorization of removed) {
    await sendMessageToHost(
      { type: "DISCONNECT_ACCOUNT" },
      preAuthorization.host,
    )
  }
})

export const handlePreAuthorizationMessage: HandleMessage<
  PreAuthorisationMessage
> = async ({ msg, sender, background: { wallet, actionQueue }, respond }) => {
  switch (msg.type) {
    case "CONNECT_DAPP": {
      const selectedAccount = await wallet.getSelectedAccount()
      if (!selectedAccount) {
        openUi()
        return
      }
      const isAuthorized = await isPreAuthorized(selectedAccount, msg.data.host)

      if (sender.tab?.id) {
        addTab({
          id: sender.tab?.id,
          host: msg.data.host,
        })
      }

      if (!isAuthorized) {
        await actionQueue.push({
          type: "CONNECT_DAPP",
          payload: { host: msg.data.host, networkId: msg.data.networkId, group: msg.data.group, keyType: msg.data.keyType },
        })
      }

      if (isAuthorized && selectedAccount?.address) {
        const walletAccountWithNetwork = await withNetwork(selectedAccount)
        return respond({
          type: "CONNECT_DAPP_RES",
          data: walletAccountWithNetwork,
        })
      }

      return openUi()
    }

    case "IS_PREAUTHORIZED": {
      const selectedAccount = await wallet.getSelectedAccount()

      if (!selectedAccount) {
        return respond({ type: "IS_PREAUTHORIZED_RES", data: false })
      }

      const valid = await isPreAuthorized(selectedAccount, msg.data)
      return respond({ type: "IS_PREAUTHORIZED_RES", data: valid })
    }

    case "REMOVE_PREAUTHORIZATION": {
      await removePreAuthorization(msg.data)
      return respond({ type: "REMOVE_PREAUTHORIZATION_RES" })
    }
  }

  throw new UnhandledMessage()
}
