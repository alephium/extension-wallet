import { getNetwork } from "./network"
import { BaseWalletAccount, WalletAccount, WalletAccountWithNetwork } from "./wallet.model"

// from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2645.md
// m / purpose' / layer' / application' / eth_address_1' / eth_address_2' / index

export const baseDerivationPath = "m/44'/9004'/0'/0"

export const hasNewDerivationPath = (derivationPath?: string): boolean =>
  Boolean(derivationPath?.startsWith(baseDerivationPath))

export const isEqualWalletAddress = (
  a: BaseWalletAccount,
  b: BaseWalletAccount,
) => {
  try {
    return a.address.toLowerCase() === b.address.toLocaleLowerCase()
  } catch (e) {
    console.error("~ isEqualWalletAddress", e)
    return false
  }
}

export const accountsEqual = (a: BaseWalletAccount, b: BaseWalletAccount) => {
  try {
    return isEqualWalletAddress(a, b) && a.networkId === b.networkId
  } catch (e) {
    console.error("~ accountsEqual", e)
    return false
  }
}

export const getAccountIdentifier = (account: BaseWalletAccount) =>
  `${account.networkId}::${account.address}`

export async function withNetwork(account: WalletAccount): Promise<WalletAccountWithNetwork> {
  const network = await getNetwork(account.networkId)
  return Promise.resolve({
    network,
    ...account
  })
}
