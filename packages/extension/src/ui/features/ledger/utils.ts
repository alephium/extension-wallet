import { AlephiumApp as LedgerApp } from '@alephium/ledger-app'
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { WalletAccount } from '../../../shared/wallet.model';
import { getHDWalletPath } from '@alephium/web3-wallet';
import { getAllLedgerAccounts } from '../accounts/useAddAccount';
import { Account } from '../accounts/Account';

export const getLedgerTransport = async () => {
  try {
    return TransportWebHID.create()
  } catch (e) {
    console.log('Web HID not supported.', e)
  }
  return TransportWebUSB.create()
}

export class LedgerAlephium {
  app: LedgerApp

  static async create(): Promise<LedgerAlephium> {
    const transport = await getLedgerTransport()
    const app = new LedgerApp(transport)
    const version = await app.getVersion()
    console.debug(`Ledger app version: ${version}`)
    return new LedgerAlephium(app)
  }

  private constructor(app: LedgerApp) {
    this.app = app
  }

  async createNewAccount(networkId: string, targetAddressGroup: number | undefined, keyType: string) {
    if (keyType !== "default") {
      throw Error("Unsupported key type: " + keyType)
    }
  
    const existingLedgerAccounts = await getAllLedgerAccounts(networkId)
    const relevantAccounts = existingLedgerAccounts.filter((account) =>
      account.signer.keyType === keyType && isAddressGroupMatched(account, targetAddressGroup)
    )
    relevantAccounts.sort((a, b) => a.signer.derivationIndex - b.signer.derivationIndex)
    for (let i = 0; i < relevantAccounts.length; i++) {
      const existingAccount = relevantAccounts[i]
      const path = getHDWalletPath(keyType, existingAccount.signer.derivationIndex + 1)
      const [newAccount, hdIndex] = await this.app.getAccount(path, targetAddressGroup, keyType)
      if (existingLedgerAccounts.find((account) => account.address === newAccount.address) === undefined) {
        await this.app.close()
        return [newAccount, hdIndex] as const
      }
    }
    const path = getHDWalletPath(keyType, 0)
    const result = await this.app.getAccount(path, targetAddressGroup, keyType)
    await this.app.close()
    return result
  }

  async verifyAccount(account: Account): Promise<boolean> {
    const path = getHDWalletPath(account.signer.keyType, account.signer.derivationIndex)
    const [deviceAccount, _] = await this.app.getAccount(path, undefined, account.signer.keyType, true)
    await this.app.close()
    return deviceAccount.address !== account.address
  }

  async signUnsignedTx(account: Account, unsignedTx: Buffer) {
    const hdPath = getHDWalletPath(account.signer.keyType, account.signer.derivationIndex)
    const signature = await this.app.signUnsignedTx(hdPath, unsignedTx)
    await this.app.close()
    return signature
  }

  async close() {
    await this.app.close()
  }
}

const isAddressGroupMatched = (account: WalletAccount, targetAddressGroup: number | undefined) => {
  if (targetAddressGroup === undefined) {
    return true
  } else {
    return account.signer.group === targetAddressGroup
  }
}
