import { connect, getAlephium } from 'alephium-get-extension-wallet-for-test'

export const silentConnectWallet = async () => {
  const windowAlephium = await connect({ showList: false })
  await windowAlephium?.enable()
  return windowAlephium
}

export const connectWallet = async () => {
  const windowAlephium = await connect({
    include: ['alephium']
  })
  await windowAlephium?.enable()
  return windowAlephium
}

export const walletAddress = async (): Promise<string | undefined> => {
  const alephium = getAlephium()
  if (!alephium?.isConnected) {
    return
  }
  return alephium.defaultAddress?.address
}
