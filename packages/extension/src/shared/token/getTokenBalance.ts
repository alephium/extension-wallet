import { ExplorerProvider, ALPH_TOKEN_ID } from "@alephium/web3"
import { AddressBalance } from '@alephium/sdk/api/explorer'
import { getNetwork } from "../network"
import { BaseWalletAccount } from "../wallet.model"

/**
 * Get balance of token at account address on network.
 */
export const getTokenBalanceForAccount = async (
  tokenAddress: string,
  account: BaseWalletAccount,
): Promise<string> => {
  const network = await getNetwork(account.networkId)
  /** fallback to single call */
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  let result: AddressBalance
  if (ALPH_TOKEN_ID === tokenAddress.slice(2)) {
    result = await explorerProvider.addresses.getAddressesAddressBalance(account.address)
  } else {
    result = await explorerProvider.addresses.getAddressesAddressTokensTokenIdBalance(account.address, tokenAddress)
  }

  return result.balance
}
