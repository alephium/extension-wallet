import { connect, getAlephium } from '@alephium/get-extension-wallet'
import { AlephiumWindowObject } from '@alephium/get-extension-wallet/dist'
import { CompiledContract, constants, shortString } from "starknet"
import { SignMessageResult } from '@alephium/web3'

import { Network } from "./token.service"

export const silentConnectWallet = async (
  onDisconnected: () => Promise<void>
) => {
  const windowAlephium = await connect({ showList: false })
  await windowAlephium?.enable({ onDisconnected, networkId: 'localhost', chainGroup: 0 })
  return windowAlephium
}

export const connectWallet = async (
  onDisconnected: () => Promise<void>
) => {
  const windowAlephium = await connect({
    include: ['alephium']
  })

  await windowAlephium?.enable({
    onDisconnected,
    networkId: 'localhost',
    chainGroup: 0
  })

  return windowAlephium
}

export const networkId = (): string | undefined => {
  return getAlephium()?.connectedNetworkId
}

export const getExplorerBaseUrl = (): string | undefined => {
  const network = networkId()
  if (network === "mainnet-alpha") {
    return "https://voyager.online"
  } else if (network === "goerli-alpha") {
    return "https://goerli.voyager.online"
  }
}

export const signMessage = async (message: string): Promise<SignMessageResult> => {
  const alephium = getAlephium()
  if (!alephium.connectedAddress || !alephium.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  return await alephium.signMessage({
    signerAddress: alephium.connectedAddress,
    networkId: alephium.connectedNetworkId,
    message
  })
}
