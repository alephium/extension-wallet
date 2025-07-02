import { getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import { Account, MessageHasher, SignerProvider, SignMessageResult, SignUnsignedTxResult } from '@alephium/web3'

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

export const signMessage = async (alephium: SignerProvider | undefined, account: Account | undefined, message: string, messageHasher: MessageHasher): Promise<SignMessageResult> => {
  if (!alephium || !account) {
    throw Error("Alephium object not initialized")
  }

  return await alephium.signMessage({
    signerAddress: account.address,
    message,
    messageHasher
  })
}

export const signUnsignedTx = async (alephium: SignerProvider | undefined, account: Account | undefined, unsignedTx: string): Promise<SignUnsignedTxResult> => {
  if (!alephium || !account) {
    throw Error("Alephium object not initialized")
  }

  return await alephium.signUnsignedTx({
    signerAddress: account.address,
    signerKeyType: account.keyType,
    unsignedTx
  })
}
