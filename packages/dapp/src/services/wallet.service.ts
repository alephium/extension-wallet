import { connect, getAlephium } from '@alephium/get-extension-wallet'

export const silentConnectWallet = async () => {
  const windowAlephium = await connect({ showList: false })
  await windowAlephium?.enable({
    chainGroup: 3,
    onDisconnected: async () => { return },
    onNetworkChanged: async () => { return }
  })
  return windowAlephium
}

export const connectWallet = async (group: number) => {
  console.log("connectWallet", group)
  const windowAlephium = await connect({
    include: ['alephium']
  })

  await windowAlephium?.enable({
    chainGroup: 3,
    onDisconnected: async () => { return },
    onNetworkChanged: async () => { return }
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
