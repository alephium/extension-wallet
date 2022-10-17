import { AddressAndPublicKey } from '../../shared/addresses'
import { sendMessage, waitForMessage } from '../../shared/messages'
import { decryptFromBackground, generateEncryptedSecret } from './crypto'

export const connectAddress = (address: AddressAndPublicKey) => {
  sendMessage({
    type: 'CONNECT_ADDRESS',
    data: address
  })
}

export const createAddress = async (group?: number) => {
  sendMessage({ type: 'NEW_ADDRESS', data: group })
  return await Promise.race([waitForMessage('NEW_ADDRESS_RES'), waitForMessage('NEW_ADDRESS_REJ')])
}

export const deleteAddress = async (address: string) => {
  sendMessage({
    type: 'DELETE_ADDRESS',
    data: { address }
  })

  try {
    await Promise.race([
      waitForMessage('DELETE_ADDRESS_RES'),
      waitForMessage('DELETE_ADDRESS_REJ').then(() => {
        throw new Error('Rejected')
      })
    ])
  } catch {
    throw Error('Could not delete address')
  }
}

export const getLastDefaultAddress = async () => {
  sendMessage({ type: 'GET_DEFAULT_ADDRESS' })
  return waitForMessage('GET_DEFAULT_ADDRESS_RES')
}

export const getAddresses = async () => {
  sendMessage({ type: 'GET_ADDRESSES' })
  return waitForMessage('GET_ADDRESSES_RES')
}

export const getBalance = async (address: string) => {
  sendMessage({ type: 'GET_ADDRESS_BALANCE', data: { address } })
  return waitForMessage('GET_ADDRESS_BALANCE_RES')
}

export const getBalances = async (addresses: string[]) => {
  sendMessage({ type: 'GET_ADDRESSES_BALANCE', data: { addresses } })
  return waitForMessage('GET_ADDRESSES_BALANCE_RES')
}

export const getAddressTokens = async (address: string) => {
  sendMessage({ type: 'GET_ADDRESS_TOKENS', data: { address } })
  return waitForMessage('GET_ADDRESS_TOKENS_RES')
}

export const getAddressTokenBalance = async (address: string, tokenId: string) => {
  sendMessage({ type: 'GET_ADDRESS_TOKEN_BALANCE', data: { address, tokenId } })
  return waitForMessage('GET_ADDRESS_TOKEN_BALANCE_RES')
}

export const getAddressesTokensBalance = async (addresses: string[]) => {
  sendMessage({ type: 'GET_ADDRESSES_TOKENS_BALANCE', data: { addresses } })
  return waitForMessage('GET_ADDRESSES_TOKENS_BALANCE_RES')
}

export const getSeedPhrase = async (): Promise<string> => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: 'GET_ENCRYPTED_SEED_PHRASE',
    data: { encryptedSecret }
  })

  const { encryptedSeedPhrase } = await waitForMessage('GET_ENCRYPTED_SEED_PHRASE_RES')

  return await decryptFromBackground(encryptedSeedPhrase, secret)
}
