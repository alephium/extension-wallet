import { connect, getAlephium } from "@h0ngcha0/get-alephium"

export const silentConnectWallet = async () => {
  const windowAlephium = await connect({ showList: false })
  await windowAlephium?.enable()
  return windowAlephium
}

export const connectWallet = async () => {
  const windowAlephium = await connect({
    include: ["alephium"],
  })
  await windowAlephium?.enable()
  return windowAlephium
}

export const walletAddress = async (): Promise<string | undefined> => {
  const alephium = getAlephium()
  if (!alephium?.isConnected) {
    return
  }
  return alephium.selectedAddress
}
