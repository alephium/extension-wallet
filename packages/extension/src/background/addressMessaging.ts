import { AddressMessage } from '../shared/messages/AddressMessage'
import { AddressToken } from '../shared/tokens'
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
      const defaultAddress = await wallet.getAlephiumDefaultAddress()
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

      return sendToTabAndUi({
        type: 'GET_ADDRESSES_BALANCE_RES',
        data: balances
      })
    }

    case 'GET_ADDRESS_TOKENS': {
      const tokens = await wallet.getAddressTokens(msg.data.address)

      return sendToTabAndUi({
        type: 'GET_ADDRESS_TOKENS_RES',
        data: tokens
      })
    }

    case 'GET_ADDRESS_TOKEN_BALANCE': {
      const { address, tokenId } = msg.data
      const tokens = await wallet.getAddressTokenBalance(address, tokenId)

      return sendToTabAndUi({
        type: 'GET_ADDRESS_TOKEN_BALANCE_RES',
        data: tokens
      })
    }

    case 'GET_ADDRESSES_TOKENS_BALANCE': {
      const tokens: AddressToken[] = []

      for (const address of msg.data.addresses) {
        const addressTokens = await wallet.getAddressTokens(address)

        for (const addressToken of addressTokens) {
          const tokensEntry = tokens.find((token) => token.id === addressToken)
          const addressTokenBalance = await wallet.getAddressTokenBalance(address, addressToken)

          if (tokensEntry) {
            tokensEntry.balance.balance += BigInt(addressTokenBalance.balance)
            tokensEntry.balance.lockedBalance += BigInt(addressTokenBalance.lockedBalance)
          } else {
            tokens.push({
              id: addressToken,
              balance: {
                balance: BigInt(addressTokenBalance.balance),
                lockedBalance: BigInt(addressTokenBalance.lockedBalance)
              }
            })
          }
        }
      }

      return sendToTabAndUi({
        type: 'GET_ADDRESSES_TOKENS_BALANCE_RES',
        data: tokens
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
