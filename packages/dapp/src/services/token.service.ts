import { getAlephium } from "@alephium/get-extension-wallet"
import { getStarknet } from "@argent/get-starknet"
import { utils } from "ethers"
import { Abi, Contract, number, uint256 } from "starknet"
import * as web3 from '@alephium/web3'
import { binToHex, contractIdFromAddress } from '@alephium/web3'
import shinyToken from '../../artifacts/shiny-token.ral.json'
import tokenTransfer from '../../artifacts/transfer.ral.json'

import Erc20Abi from "../../abi/ERC20.json"

export const erc20TokenAddressByNetwork = {
  "goerli-alpha":
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "mainnet-alpha":
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
}

export type PublicNetwork = keyof typeof erc20TokenAddressByNetwork
export type Network = PublicNetwork | "localhost"

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
  const alephium = getAlephium()
  if (!alephium.explorerProvider) {
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
  const alephium = getAlephium()
  if (!alephium.explorerProvider) {
    console.log("Alephium explorer provider not initialized")
    return []
  }

  const balance = await alephium.explorerProvider.addresses.getAddressesAddressBalance(address)

  return balance
}

function getUint256CalldataFromBN(bn: number.BigNumberish) {
  return { type: "struct" as const, ...uint256.bnToUint256(bn) }
}

export function parseInputAmountToUint256(
  input: string,
  decimals: number = 18,
) {
  return getUint256CalldataFromBN(utils.parseUnits(input, decimals).toString())
}

export const mintToken = async (
  mintAmount: string,
  network?: string
): Promise<web3.SignDeployContractTxResult> => {
  const alephium = getAlephium()
  if (!alephium.connectedAddress || !alephium.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  const tokenContract = web3.Contract.fromJson(shinyToken)
  const txResult = tokenContract.deploy(
    alephium,
    {
      initialAttoAlphAmount: BigInt(1100000000000000000),
      issueTokenAmount: BigInt(mintAmount),
    }
  )

  return txResult
}

export const withdrawMintedToken = async (
  amount: string,
  tokenAddress: string
): Promise<web3.SignExecuteScriptTxResult> => {
  const alephium = getAlephium()
  if (!alephium.connectedAddress || !alephium.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  const script = web3.Script.fromJson(tokenTransfer)
  return await script.execute(
    alephium,
    {
      initialFields: {
        shinyTokenId: binToHex(contractIdFromAddress(tokenAddress)),
        to: alephium.connectedAddress,
        amount: BigInt(amount)
      }
    }
  )
}
export const transferToken = async (
  tokenAddress: string,
  transferTo: string,
  transferAmount: string,
  network?: string
): Promise<web3.SignTransferTxResult> => {
  const alephium = getAlephium()
  if (!alephium.connectedAddress || !alephium.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  return await alephium.signAndSubmitTransferTx({
    signerAddress: alephium.connectedAddress,
    destinations: [{
      address: transferTo,
      attoAlphAmount: BigInt(10000000000000000),
      tokens: [{
        id: tokenAddress,
        amount: BigInt(transferAmount)
      }
      ]
    }],
    networkId: network || alephium.connectedNetworkId
  })
}
