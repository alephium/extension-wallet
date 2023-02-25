import { connect, getAlephium } from '@alephium/get-extension-wallet'
import { MessageHasher, SignMessageResult } from '@alephium/web3'

export const silentConnectWallet = async (
  onDisconnected: () => Promise<void>
) => {
  return connectAlephium(false, onDisconnected)
}

export const connectWallet = async (
  onDisconnected: () => Promise<void>
) => {
  return connectAlephium(true, onDisconnected)
}

async function connectAlephium(showList: boolean, onDisconnected: () => Promise<void>) {
  let windowAlephium = await connect({ include: ['alephium'], showList: showList })
  return windowAlephium?.enable({ onDisconnected, networkId: 'devnet', chainGroup: 0 }).catch(() => undefined)
}

export const disconnectWallet = () => {
  const alephium = getAlephium()
  return alephium?.disconnect()
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

export const signMessage = async (message: string, messageHasher: MessageHasher): Promise<SignMessageResult> => {
  const alephium = getAlephium()
  if (!alephium.connectedAccount || !alephium.connectedNetworkId) {
    throw Error("alephium object not initialized")
  }

  return await alephium.signMessage({
    signerAddress: alephium.connectedAccount.address,
    message,
    messageHasher
  })
}
