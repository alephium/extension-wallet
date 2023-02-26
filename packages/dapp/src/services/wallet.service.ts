import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { MessageHasher, SignMessageResult } from '@alephium/web3'

export const silentConnectWallet = async (
  onDisconnected: () => Promise<void>
) => {
  const alephium = getDefaultAlephiumWallet()
  if (alephium === undefined) {
    return undefined
  }
  return alephium?.enableIfPreauthorized({ onDisconnected, networkId: 'devnet', chainGroup: 0 })
    .catch((error: any) => {
      console.error(error)
      return undefined
    })
}

export const connectWallet = async (
  onDisconnected: () => Promise<void>
) => {
  const alephium = getDefaultAlephiumWallet()
  if (alephium === undefined) {
    return undefined
  }
  return alephium?.enable({ onDisconnected, networkId: 'devnet', chainGroup: 0 })
    .catch((error: any) => {
      console.error(error)
      throw undefined
    })
}

export const disconnectWallet = () => {
  const alephium = getDefaultAlephiumWallet()
  return alephium?.disconnect()
}

export const networkId = (): string | undefined => {
  return getDefaultAlephiumWallet()?.connectedNetworkId
}

export const getExplorerBaseUrl = (): string | undefined => {
  const network = networkId()
  if (network === "mainnet-alpha") {
    return "https://voyager.online"
  } else if (network === "goerli-alpha") {
    return "https://goerli.voyager.online"
  }
}

export const signMessage = async (message: string, messageHasher: MessageHasher): Promise<SignMessageResult> => {
  const alephium = getDefaultAlephiumWallet()
  if (!alephium?.connectedAccount || !alephium?.connectedNetworkId) {
    throw Error("Alephium object not initialized")
  }

  return await alephium.signMessage({
    signerAddress: alephium.connectedAccount.address,
    message,
    messageHasher
  })
}
