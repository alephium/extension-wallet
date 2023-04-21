import LedgerApp from '@alephium/ledger-app'
import Transport from "@ledgerhq/hw-transport"
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { WalletAccount } from '../../../shared/wallet.model';
import { getHDWalletPath } from '@alephium/web3-wallet';

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

const isAddressGroupMatched = (account: WalletAccount, targetAddressGroup: number | undefined) => {
  if (targetAddressGroup === undefined) {
    return true
  } else {
    return account.signer.group === targetAddressGroup
  }
}

export const deriveAccount = async (existingLedgerAccounts: WalletAccount[], targetAddressGroup: number | undefined, keyType: string) => {
  if (keyType !== "default" && keyType !== "bip340-schnorr") {
    throw Error("Unsupported key type: " + keyType)
  }

  const app = await getLedgerApp()
  const relevantAccounts = existingLedgerAccounts.filter((account) =>
    account.signer.keyType === keyType && isAddressGroupMatched(account, targetAddressGroup)
  )
  relevantAccounts.sort((a, b) => a.signer.derivationIndex - b.signer.derivationIndex)
  console.log(`===== relevantAccounts`, relevantAccounts)
  for (let i = 0; i < relevantAccounts.length; i++) {
    const existingAccount = relevantAccounts[i]
    const path = getHDWalletPath(keyType, existingAccount.signer.derivationIndex + 1)
    console.log(`===== path`, path)
    const [newAccount, hdIndex] = await app.getAccount(path, targetAddressGroup, keyType)
    if (existingLedgerAccounts.find((account) => account.address === newAccount.address) === undefined) {
      await app.close()
      return [newAccount, hdIndex] as const
    }
  }
  const path = getHDWalletPath(keyType, 0)
  console.log(`===== path`, path)
  const result = await app.getAccount(path, targetAddressGroup, keyType)
  await app.close()
  return result
}
