import { connect, getAlephium } from '@alephium/get-extension-wallet'

export const silentConnectWallet = async (onDisconnected: () => Promise<void>) => {
  const windowAlephium = await connect({ showList: false })
  await windowAlephium?.enable({ onDisconnected, networkId: 'testnet' })
  return windowAlephium
}

export const connectWallet = async (
  onDisconnected: () => Promise<void>,
  group?: number
) => {
  const windowAlephium = await connect({
    include: ['alephium']
  })

  await windowAlephium?.enable({
    onDisconnected,
    networkId: 'testnet',
    chainGroup: group
  })
  return windowAlephium
}

export const walletAddress = async (): Promise<string | undefined> => {
  const alephium = getAlephium()
  if (!alephium?.isConnected) {
    return
  }
  return alephium.defaultAddress?.address
}
