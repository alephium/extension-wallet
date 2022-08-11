import {
  Address,
  AddressAndPublicKey,
  AddressSettings,
} from "../../../shared/Address"
import { createAddress } from "../../services/backgroundAddresses"
import { startSession } from "../../services/backgroundSessions"

export const deployAddress = async (password?: string) => {
  if (password) {
    await startSession(password)
  }

  const result = await createAddress()
  if ("error" in result) {
    throw new Error(result.error)
  }

  return toAddress(result)
}

export const toAddress = (addressAndPublicKey: AddressAndPublicKey) => {
  // TODO: Remove hardcoded setting
  const setting: AddressSettings = {
    isMain: true,
  }

  return new Address(
    addressAndPublicKey.address,
    addressAndPublicKey.publicKey,
    addressAndPublicKey.addressIndex,
    setting,
  )
}
