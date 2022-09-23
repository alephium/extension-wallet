import { AddressMessage } from '../shared/messages/AddressMessage'
import { sendMessageToUi } from './activeTabs'
import { HandleMessage, UnhandledMessage } from './background'
import { encryptForUi } from './crypto'

export const handleAddressMessage: HandleMessage<AddressMessage> = async ({
  msg,
  background: { wallet },
  messagingKeys: { privateKey },
  sendToTabAndUi
}) => {
  switch (msg.type) {
    case 'GET_ADDRESSES': {
      return sendToTabAndUi({
        type: 'GET_ADDRESSES_RES',
        data: await wallet.getAlephiumAddresses()
      })
    }

    case 'CONNECT_ADDRESS': {
      return await wallet.selectAlephiumAddress(msg.data.address)
    }

    case 'NEW_ADDRESS': {
      if (!wallet.isSessionOpen()) {
        throw Error('you need an open session')
      }

      //const group = msg.data
      try {
        const address = await wallet.addAlephiumAddress(msg.data)
        if (address) {
          return sendToTabAndUi({
            type: 'NEW_ADDRESS_RES',
            data: address
          })
        } else {
          throw Error('Fail to generate address')
        }
      } catch (exception: unknown) {
        return sendToTabAndUi({
          type: 'NEW_ADDRESS_REJ',
          data: {
            error: `create new address failed, ${exception}`
          }
        })
      }
    }

    case 'GET_DEFAULT_ADDRESS': {
      const defaultAddress = await wallet.getAlephiumDefaultAddresses()
      return sendToTabAndUi({
        type: 'GET_DEFAULT_ADDRESS_RES',
        data: defaultAddress
      })
    }

    case 'GET_ADDRESS_BALANCE': {
      const balance = await wallet.getBalance(msg.data.address)
      return sendToTabAndUi({
        type: 'GET_ADDRESS_BALANCE_RES',
        data: balance
      })
    }

    case 'GET_ADDRESSES_BALANCE': {
      console.log('GET_ADDRESSES_BALANCE')
      const balances = await Promise.all(
        msg.data.addresses.map(async (address) => {
          return await wallet.getBalance(address)
        })
      )

      console.log(balances)

      return sendToTabAndUi({
        type: 'GET_ADDRESSES_BALANCE_RES',
        data: balances
      })
    }

    case 'GET_ENCRYPTED_SEED_PHRASE': {
      if (!wallet.isSessionOpen()) {
        throw Error('you need an open session')
      }

      const encryptedSeedPhrase = await encryptForUi(await wallet.getSeedPhrase(), msg.data.encryptedSecret, privateKey)

      return sendMessageToUi({
        type: 'GET_ENCRYPTED_SEED_PHRASE_RES',
        data: { encryptedSeedPhrase }
      })
    }
  }

  throw new UnhandledMessage()
}
