import { PreAuthorisationMessage } from '../shared/messages/PreAuthorisationMessage'
import { addTab, removeTabOfHost, sendMessageToHost } from './activeTabs'
import { UnhandledMessage } from './background'
import { HandleMessage } from './background'
import { openUi } from './openUi'
import { isPreAuthorized, removePreAuthorization, resetPreAuthorizations } from './preAuthorizations'

export const handlePreAuthorizationMessage: HandleMessage<PreAuthorisationMessage> = async ({
  msg,
  sender,
  background: { wallet, actionQueue },
  sendToTabAndUi
}) => {
  switch (msg.type) {
    case 'CONNECT_DAPP': {
      const { host, group } = msg.data
      const defaultAddress = await wallet.getAlephiumDefaultAddress(group)
      const isAuthorized = await isPreAuthorized(msg.data.host)

      if (sender.tab?.id) {
        addTab({
          id: sender.tab?.id,
          host: host
        })
      }

      if (!isAuthorized) {
        await actionQueue.push({
          type: 'CONNECT_DAPP',
          payload: { host: msg.data.host }
        })
      }

      if (isAuthorized && defaultAddress?.address) {
        return sendToTabAndUi({
          type: 'CONNECT_DAPP_RES',
          data: defaultAddress
        })
      }

      return openUi()
    }

    case 'PREAUTHORIZE': {
      return actionQueue.push({
        type: 'CONNECT_DAPP',
        payload: { host: msg.data }
      })
    }

    case 'IS_PREAUTHORIZED': {
      const valid = await isPreAuthorized(msg.data)
      return sendToTabAndUi({ type: 'IS_PREAUTHORIZED_RES', data: valid })
    }

    case 'REMOVE_PREAUTHORIZATION': {
      const host = msg.data
      await removePreAuthorization(host)
      await sendToTabAndUi({ type: 'REMOVE_PREAUTHORIZATION_RES' })
      await sendMessageToHost({ type: 'DISCONNECT_ADDRESS' }, host)
      removeTabOfHost(host)
      break
    }

    case 'RESET_PREAUTHORIZATIONS': {
      await resetPreAuthorizations()
      return sendToTabAndUi({ type: 'DISCONNECT_ADDRESS' })
    }

    case 'REJECT_PREAUTHORIZATION': {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
