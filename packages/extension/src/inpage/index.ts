import { WindowMessageType } from '../shared/messages'
import { alephiumWindowObject, userEventHandlers } from './alephiumWindowObject'
import { isPlainObject } from 'lodash-es'

function attach() {
  window.alephiumProviders =
    (window.alephiumProviders && isPlainObject(window.alephiumProviders)) ?
      window.alephiumProviders : {}

  try {
    delete window.alephiumProviders.alephium
    // set read only property to window
    Object.defineProperty(window.alephiumProviders, 'alephium', {
      value: alephiumWindowObject,
      writable: false
    })
  } catch {
    // ignore
  }

  // we need 2 different try catch blocks because we want to execute both even if one of them fails
  try {
    window.alephiumProviders.alephium = alephiumWindowObject
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
  const { alephiumProviders } = window
  const alephium = alephiumProviders?.alephium
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
    const { network } = data.data

    if (network.id !== alephium.currentNetwork) {
      alephium.currentNetwork = network.id

      for (const userEvent of userEventHandlers) {
        if (userEvent.type === 'networkChanged') {
          userEvent.handler(network)
        }
      }
    }
  }
})
