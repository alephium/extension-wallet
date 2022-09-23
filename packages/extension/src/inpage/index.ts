import { WindowMessageType } from '../shared/messages'
import { alephiumWindowObject, userEventHandlers } from './alephiumWindowObject'

function attach() {
  try {
    delete window.alephium
    // set read only property to window
    Object.defineProperty(window, 'alephium', {
      value: alephiumWindowObject,
      writable: false
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
window.addEventListener('load', () => attachHandler())
document.addEventListener('DOMContentLoaded', () => attachHandler())
document.addEventListener('readystatechange', () => attachHandler())

window.addEventListener('message', async ({ data }: MessageEvent<WindowMessageType>) => {
  const { alephium } = window
  if (!alephium) {
    return
  }
  if (data.type === 'CONNECT_ADDRESS') {
    const { address, publicKey, addressIndex } = data.data
    if (address !== alephium.defaultAddress?.address) {
      alephium.defaultAddress = {
        address,
        publicKey: publicKey,
        group: addressIndex
      }

      for (const userEvent of userEventHandlers) {
        if (userEvent.type === 'addressesChanged') {
          userEvent.handler([address])
        }
      }
    }
  } else if (data.type === 'DISCONNECT_ADDRESS') {
    alephium.defaultAddress = undefined
    alephium.isConnected = false
    for (const userEvent of userEventHandlers) {
      if (userEvent.type === 'addressesChanged') {
        userEvent.handler([])
      }
    }
  } else if (data.type === 'SET_CURRENT_NETWORK_RES') {
    const { networkId } = data.data

    if (networkId !== alephium.currentNetwork) {
      alephium.currentNetwork = networkId

      for (const userEvent of userEventHandlers) {
        if (userEvent.type === 'networkChanged') {
          userEvent.handler(networkId)
        }
      }
    }
  }
})
