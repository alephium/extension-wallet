import { differenceWith, isEqual } from "lodash-es"

import { PreAuthorisationMessage } from "../shared/messages/PreAuthorisationMessage"
import { getPreAuthorized, isPreAuthorized, preAuthorizeStore, removePreAuthorization, setConnectionExpiryAlarm } from "../shared/preAuthorizations"
import { withNetwork } from "../shared/wallet.service"
import { addTab, sendMessageToHost } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"

preAuthorizeStore.subscribe(async (_, changeSet) => {
  const removed = differenceWith(changeSet.oldValue ?? [], changeSet.newValue ?? [], isEqual)
  for (const preAuthorization of removed) {
    await sendMessageToHost(
      { type: "ALPH_DISCONNECT_ACCOUNT" },
      preAuthorization.host,
    )
  }
})

export const handlePreAuthorizationMessage: HandleMessage<
  PreAuthorisationMessage
> = async ({ msg, sender, background: { wallet, actionQueue }, respond }) => {
  switch (msg.type) {
    case "ALPH_CONNECT_DAPP": {
      const selectedAccount = await wallet.getSelectedAccount()
      if (!selectedAccount) {
        openUi()
        return
      }
      const authorized = await getPreAuthorized(msg.data)

      if (sender.tab?.id) {
        addTab({
          id: sender.tab?.id,
          host: msg.data.host,
        })
      }

      if (!authorized) {
        await actionQueue.push({
          type: "ALPH_CONNECT_DAPP",
          payload: { host: msg.data.host, networkId: msg.data.networkId, group: msg.data.group, keyType: msg.data.keyType },
        })
      }

      if (authorized) {
        await setConnectionExpiryAlarm(msg.data.host)
        const authorizedAccount = await wallet.getAccount(authorized.account)
        const walletAccountWithNetwork = await withNetwork(authorizedAccount)
        return respond({
          type: "ALPH_CONNECT_DAPP_RES",
          data: walletAccountWithNetwork,
        })
      }

      return openUi()
    }

    case "ALPH_IS_PREAUTHORIZED": {
      const valid = await isPreAuthorized(msg.data)
      return respond({ type: "ALPH_IS_PREAUTHORIZED_RES", data: valid })
    }

    case "ALPH_REMOVE_PREAUTHORIZATION": {
      await removePreAuthorization(msg.data)
      return respond({ type: "ALPH_REMOVE_PREAUTHORIZATION_RES" })
    }
  }

  throw new UnhandledMessage()
}
