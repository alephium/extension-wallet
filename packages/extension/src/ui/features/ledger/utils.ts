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
    console.log('Web HID not supported.', e)
  }

  transport = await TransportWebUSB.create()
  return transport
}

export const getLedgerApp = async () => {
  const transport = await getLedgerTransport()
  const app = new LedgerApp(transport)
  await app.getVersion()
  return app
}

export const deriveAccount = async (targetAddressGroup?: number) => {
  const app = await getLedgerApp()
  const path = `m/44'/1234'/0'/0/0`
  return await app.getAccount(path, targetAddressGroup)
}
