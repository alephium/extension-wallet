import { connect, getAlephium } from '@alephium/get-extension-wallet'

export const silentConnectWallet = async () => {
  const windowAlephium = await connect({ showList: false })
  await windowAlephium?.enable()
  return windowAlephium
}

export const connectWallet = async (
  onDisconnected: () => Promise<void>,
  onNetworkChanged: (network: { networkName: string, networkId: number }) => Promise<void>,
  group?: number
) => {
  const windowAlephium = await connect({
    include: ['alephium']
  })

  await windowAlephium?.enable({
    onDisconnected,
    onNetworkChanged,
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
