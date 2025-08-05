import { explorer, ExplorerProvider, ALPH_TOKEN_ID, NodeProvider } from "@alephium/web3"
import { getNetwork } from "../network"
import { BaseWalletAccount } from "../wallet.model"
import { BigNumber } from "ethers"

/**
 * Get balance of token at account address on network.
 */
export const getTokenBalanceForAccount = async (
  tokenId: string,
  account: BaseWalletAccount,
): Promise<string> => {
  const network = await getNetwork(account.networkId)
  try {
    const explorerProvider = new ExplorerProvider(network.explorerApiUrl)

    let result: explorer.AddressBalance
    if (ALPH_TOKEN_ID === tokenId) {
      result = await explorerProvider.addresses.getAddressesAddressBalance(account.address)
    } else {
      result = await explorerProvider.addresses.getAddressesAddressTokensTokenIdBalance(account.address, tokenId)
    }
    return result.balance
  } catch (error) {
    console.log('Explorer backend failed, falling back to full node', error)
    const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)
    const result = await nodeProvider.addresses.getAddressesAddressBalance(account.address)

    if (ALPH_TOKEN_ID === tokenId) {
      return result.balance
    } else {
      const tokenBalance = result.tokenBalances?.find(token => token.id === tokenId)
      return tokenBalance?.amount || "0"
    }
  }
}

export function addTokenToBalances(balances: Map<string, BigNumber>, tokenId: string, amount: BigNumber) {
  const tokenBalance = balances.get(tokenId)
  if (tokenBalance === undefined) {
    balances.set(tokenId, amount)
  } else {
    balances.set(tokenId, tokenBalance.add(amount))
  }
}

export async function getBalances(nodeProvider: NodeProvider, address: string): Promise<Map<string, BigNumber>> {
  const result = await nodeProvider.addresses.getAddressesAddressBalance(address)
  const balances = new Map<string, BigNumber>()
  balances.set(ALPH_TOKEN_ID, BigNumber.from(result.balance))
  if (result.tokenBalances !== undefined) {
    result.tokenBalances.forEach((token) => addTokenToBalances(balances, token.id, BigNumber.from(token.amount)))
  }
  return balances
}
