import LedgerApp from '@alephium/ledger-app'
import Transport from "@ledgerhq/hw-transport"
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

export const getLedgerTransport = async () => {
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

export const deriveAccount = async () => {
  const transport = await getLedgerTransport()
  const app = new LedgerApp(transport)
  const path = `m/44'/1234'/0'/0/0`
  return await app.getAccount(path)
}
