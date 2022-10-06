import { Address, AddressAndPublicKey } from '../../../shared/addresses'
import { createAddress } from '../../services/backgroundAddresses'
import { startSession } from '../../services/backgroundSessions'

export const deployAddress = async (group?: number, password?: string) => {
  if (password) {
    await startSession(password)
  }

  const result = await createAddress(group)
  if ('error' in result) {
    throw new Error(result.error)
  }

  return toAddress(result)
}

export const toAddress = (addressAndPublicKey: AddressAndPublicKey) => {
  return new Address(addressAndPublicKey.address, addressAndPublicKey.publicKey, addressAndPublicKey.addressIndex)
}
