import { getDefaultAlephiumWallet } from "@alephium/get-extension-wallet"
import * as web3 from '@alephium/web3'
import { binToHex, contractIdFromAddress, DUST_AMOUNT, SignTransferChainedTxParams, stringToHex } from '@alephium/web3'
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

export const getTokenBalances = async (signer: web3.SignerProvider | undefined, address: string): Promise<TokenBalance[]> => {
  if (!signer?.explorerProvider) {
    console.log("Alephium explorer provider not initialized")
    return []
  }

  const tokens: TokenBalance[] = []
  const addressTokens = await signer.explorerProvider.addresses.getAddressesAddressTokens(address)

  for (const addressToken of addressTokens) {
    const tokensEntry = tokens.find((token) => token.id === addressToken)
    const addressTokenBalance = await signer.explorerProvider.addresses.getAddressesAddressTokensTokenIdBalance(address, addressToken)

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

export const getAlphBalance = async (signer: web3.SignerProvider | undefined, address: string) => {
  if (!signer?.explorerProvider) {
    console.log("Alephium explorer provider not initialized")
    return undefined
  }

  const balance = await signer.explorerProvider.addresses.getAddressesAddressBalance(address)

  return balance
}

export const mintToken = async (signer: web3.SignerProvider | undefined, amount: string, network: string, group?: number): Promise<web3.DeployContractResult<ShinyTokenInstance>> => {
  if (!signer) throw Error('Wallet not connected')

  return ShinyToken.deploy(signer, {
    initialFields: {
      name: stringToHex("ShinyToken"),
      symbol: stringToHex("SHINY"),
      decimals: 0n,
      totalSupply: BigInt(amount)
    },
    initialAttoAlphAmount: web3.MINIMAL_CONTRACT_DEPOSIT + web3.ONE_ALPH,
    issueTokenAmount: BigInt(amount),
  }, group)
}

export const withdrawMintedToken = async (
  signer: web3.SignerProvider | undefined,
  account: web3.Account | undefined,
  amount: string,
  tokenAddress: string,
  transferTo?: string
): Promise<web3.SignExecuteScriptTxResult> => {
  if (signer === undefined || account === undefined) {
    throw Error("alephium object not initialized")
  }

  let toAddress = account.address
  if (web3.isGrouplessAddressWithoutGroupIndex(account.address)) {
    const groupIndex = web3.groupOfAddress(tokenAddress)
    toAddress = `${toAddress}:${groupIndex}`
  }

  const tokenId = binToHex(contractIdFromAddress(tokenAddress))
  if (!transferTo) {
    return Transfer.execute(
      {
        signer,
        initialFields: {
          shinyToken: tokenId,
          to: toAddress,
          amount: BigInt(amount)
        }
      }
    )
  } else {
    const withdrawParams = await Transfer.script.txParamsForExecution({
      signer,
      initialFields: {
        shinyToken: tokenId,
        to: toAddress,
        amount: BigInt(amount)
      }
    })
    const transferParams: SignTransferChainedTxParams = {
      signerAddress: toAddress,
      destinations: [
        { address: transferTo, attoAlphAmount: DUST_AMOUNT, tokens: [{ id: tokenId, amount: BigInt(amount) }] }
      ],
      type: 'Transfer'
    }
    const [_, withdrawTxResult] = await signer.signAndSubmitChainedTx([
      { ...withdrawParams, type: 'ExecuteScript' },
      { ...transferParams, type: 'Transfer' }
    ])

    return withdrawTxResult as web3.SignExecuteScriptChainedTxResult
  }
}

export const transferToken = async (
  signer: web3.SignerProvider | undefined,
  account: web3.Account | undefined,
  tokenId: string,
  transferTo: string,
  transferAmount: string,
  network?: string
): Promise<web3.SignTransferTxResult> => {
  if (!signer || !account) {
    throw Error("alephium object not initialized")
  }

  return await signer.signAndSubmitTransferTx({
    signerAddress: account.address,
    destinations: [{
      address: transferTo,
      attoAlphAmount: DUST_AMOUNT,
      tokens: [{
        id: tokenId,
        amount: BigInt(transferAmount)
      }
      ]
    }]
  }) as web3.SignTransferTxResult
}

export const destroyTokenContract = async (
  signer: web3.SignerProvider | undefined,
  account: web3.Account | undefined,
  tokenId: string,
): Promise<web3.ExecuteScriptResult> => {
  if (!signer || !account) {
    throw Error("alephium object not initialized")
  }

  let toAddress = account.address
  if (web3.isGrouplessAddressWithoutGroupIndex(account.address)) {
    const groupIndex = web3.groupOfAddress(web3.addressFromContractId(tokenId))
    toAddress = `${toAddress}:${groupIndex}`
  }

  return Destroy.execute(
    {
      signer,
      initialFields: {
        shinyToken: tokenId,
        to: toAddress,
      }
    }
  )
}
