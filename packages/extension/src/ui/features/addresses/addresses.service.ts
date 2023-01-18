import { Address, AddressAndPublicKey } from '../../../shared/addresses'
import { createAddress } from '../../services/backgroundAddresses'
import { startSession } from '../../services/backgroundSessions'
import LedgerApp from '@alephium/ledger-app'
import Transport from "@ledgerhq/hw-transport"
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

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
  return new Address('browser', addressAndPublicKey.address, addressAndPublicKey.publicKey, addressAndPublicKey.addressIndex)
}

const getLedgerTransport = async () => {
  let transport: Transport

  try {
    transport = await TransportWebHID.create()
    return transport
  } catch (e) {
    console.log('Web HID not supported.')
  }

  transport = await TransportWebUSB.create()
  return transport
}

export const importLedgerAddress = async (path: string) => {
  const transport = await getLedgerTransport()
  const app = new LedgerApp(transport)
  const account = await app.getAccount(path)
  const splitedPath = splitPath(path)
  const addressIndex = splitedPath[splitedPath.length - 1]
  await transport.close()

  return new Address('ledger', account.address, account.publicKey, addressIndex)
}

export function splitPath(path: string): number[] {
  const result: number[] = []
  const allComponents = path.trim().split('/')
  const components = allComponents.length > 0 && allComponents[0] == 'm' ? allComponents.slice(1) : allComponents
  components.forEach((element) => {
    let number = parseInt(element, 10)
    if (isNaN(number)) {
      throw Error(`Invalid bip32 path: ${path}`)
    }
    if (element.length > 1 && element[element.length - 1] === "'") {
      number += 0x80000000
    }
    result.push(number)
  })
  return result
}
