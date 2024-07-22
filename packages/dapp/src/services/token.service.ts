import { getDefaultAlephiumWallet } from "@alephium/get-extension-wallet"
import * as web3 from '@alephium/web3'
import { binToHex, contractIdFromAddress, DUST_AMOUNT, stringToHex } from '@alephium/web3'
import { Destroy, ShinyToken, ShinyTokenInstance, Transfer } from '../../artifacts/ts'

export const erc20TokenAddressByNetwork = {
  "goerli-alpha":
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "mainnet-alpha":
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
}

export type PublicNetwork = keyof typeof erc20TokenAddressByNetwork
export type Network = PublicNetwork | "devnet"

export type TokenBalance = {
  id: string
  balance: {
    balance: bigint
    lockedBalance: bigint
  }
}

export const getErc20TokenAddress = (network: PublicNetwork) =>
  erc20TokenAddressByNetwork[network]

export const getTokenBalances = async (address: string): Promise<TokenBalance[]> => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.explorerProvider) {
    console.log("Alephium explorer provider not initialized")
    return []
  }

  const tokens: TokenBalance[] = []
  const addressTokens = await alephium.explorerProvider.addresses.getAddressesAddressTokens(address)

  for (const addressToken of addressTokens) {
    const tokensEntry = tokens.find((token) => token.id === addressToken)
    const addressTokenBalance = await alephium.explorerProvider.addresses.getAddressesAddressTokensTokenIdBalance(address, addressToken)

    if (tokensEntry) {
      tokensEntry.balance.balance += BigInt(addressTokenBalance.balance)
      tokensEntry.balance.lockedBalance += BigInt(addressTokenBalance.lockedBalance)
    } else {
      tokens.push({
        id: addressToken,
        balance: {
          balance: BigInt(addressTokenBalance.balance),
          lockedBalance: BigInt(addressTokenBalance.lockedBalance)
        }
      })
    }
  }

  return tokens
}

export const getAlphBalance = async (address: string) => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.explorerProvider) {
    console.log("Alephium explorer provider not initialized")
    return undefined
  }

  const balance = await alephium.explorerProvider.addresses.getAddressesAddressBalance(address)

  return balance
}

export const mintToken = async (
  mintAmount: string,
  network?: string
): Promise<web3.DeployContractResult<ShinyTokenInstance>> => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.connectedAccount || !alephium?.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  return ShinyToken.deploy(alephium, {
    initialFields: {
      name: stringToHex("ShinyToken"),
      symbol: stringToHex("SHINY"),
      decimals: 0n,
      totalSupply: BigInt(mintAmount)
    },
    initialAttoAlphAmount: BigInt(1100000000000000000),
    issueTokenAmount: BigInt(mintAmount),
  })
}

export const withdrawMintedToken = async (
  amount: string,
  tokenId: string
): Promise<web3.SignExecuteScriptTxResult> => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.connectedAccount || !alephium?.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  return Transfer.execute(
    alephium,
    {
      initialFields: {
        shinyToken: binToHex(contractIdFromAddress(tokenId)),
        to: alephium.connectedAccount.address,
        amount: BigInt(amount)
      }
    }
  )
}
export const transferToken = async (
  tokenId: string,
  transferTo: string,
  transferAmount: string,
  network?: string
): Promise<web3.SignTransferTxResult> => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.connectedAccount || !alephium?.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  return await alephium.signAndSubmitTransferTx({
    signerAddress: alephium.connectedAccount.address,
    destinations: [{
      address: transferTo,
      attoAlphAmount: DUST_AMOUNT,
      tokens: [{
        id: tokenId,
        amount: BigInt(transferAmount)
      }
      ]
    }]
  })
}

export const destroyTokenContract = async (
  tokenId: string,
): Promise<web3.ExecuteScriptResult> => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.connectedAccount || !alephium?.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  return Destroy.execute(
    alephium,
    {
      initialFields: {
        shinyToken: binToHex(contractIdFromAddress(tokenId)),
        to: alephium.connectedAccount.address,
      }
    }
  )
}
