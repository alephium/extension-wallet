import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { MessageHasher, SignMessageResult, SignUnsignedTxResult } from '@alephium/web3'

export const silentConnectWallet = async (
  onDisconnected: () => Promise<void>
) => {
  const alephium = await getDefaultAlephiumWallet()
  if (alephium === undefined) {
    return undefined
  }
  return alephium?.enableIfConnected({ onDisconnected, networkId: 'devnet' })
    .catch((error: any) => {
      console.error(error)
      return undefined
    })
}

export const connectWallet = async (
  onDisconnected: () => Promise<void>
) => {
  const alephium = await getDefaultAlephiumWallet()
  if (alephium === undefined) {
    return undefined
  }
  return alephium?.enable({ onDisconnected, networkId: 'devnet' })
    .catch((error: any) => {
      console.error(error)
      throw undefined
    })
}

export const disconnectWallet = async () => {
  const alephium = await getDefaultAlephiumWallet()
  return alephium?.disconnect()
}

export const addToken = async (id: string): Promise<boolean> => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.connectedAccount || !alephium?.connectedNetworkId) {
    throw Error("Alephium object not initialized")
  }
  return await alephium.request({
    type: "AddNewToken",
    params: {
      id: id,
      networkId: 'devnet',
      symbol: '',
      decimals: 0,
      name: '',
      logoURI: ''
    },
  })
}

export const getExplorerBaseUrl = (): string | undefined => {
  return 'http://localhost:23000'
}

export const signMessage = async (message: string, messageHasher: MessageHasher): Promise<SignMessageResult> => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.connectedAccount || !alephium?.connectedNetworkId) {
    throw Error("Alephium object not initialized")
  }

  return await alephium.signMessage({
    signerAddress: alephium.connectedAccount.address,
    message,
    messageHasher
  })
}

export const signUnsignedTx = async (unsignedTx: string): Promise<SignUnsignedTxResult> => {
  const alephium = await getDefaultAlephiumWallet()
  if (!alephium?.connectedAccount || !alephium?.connectedNetworkId) {
    throw Error("Alephium object not initialized")
  }

  return await alephium.signUnsignedTx({
    signerAddress: alephium.connectedAccount.address,
    signerKeyType: alephium.connectedAccount.keyType,
    unsignedTx
  })
}
