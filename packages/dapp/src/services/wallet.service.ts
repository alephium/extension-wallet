import { connect, getAlephium } from '@alephium/get-extension-wallet'
import { AlephiumWindowObject } from '@alephium/get-extension-wallet/dist'
//import { connect, getStarknet } from "@argent/get-starknet"
import { CompiledContract, constants, shortString } from "starknet"

import { Network } from "./token.service"

export const silentConnectWallet = async (onDisconnected: () => Promise<void>) => {
  const windowAlephium = await connect({ showList: false })
  await windowAlephium?.enable({ onDisconnected, networkId: 'devnet' })
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
    networkId: 'devnet',
    chainGroup: group
  })

  return windowAlephium
}

export const networkId = (): string | undefined => {
  return getAlephium()?.connectedNetworkId
}

//export const addToken = async (address: string): Promise<void> => {
//  const starknet = getStarknet()
//  if (!starknet?.isConnected) {
//    throw Error("starknet wallet not connected")
//  }
//  await starknet.request({
//    type: "wallet_watchAsset",
//    params: {
//      type: "ERC20",
//      options: {
//        address,
//      },
//    },
//  })
//}

export const getExplorerBaseUrl = (): string | undefined => {
  const network = networkId()
  if (network === "mainnet-alpha") {
    return "https://voyager.online"
  } else if (network === "goerli-alpha") {
    return "https://goerli.voyager.online"
  }
}

//export const chainId = (): string | undefined => {
//  const alephium = getAlephium()
//  return alephium?.currentNetwork
//}

export const signMessage = async (message: string) => {
  console.log("signing message", message)

  return Promise.resolve([])
}
//export const signMessage = async (message: string) => {
//  const starknet = getStarknet()
//  if (!starknet?.isConnected) throw Error("starknet wallet not connected")
//  if (!shortString.isShortString(message)) {
//    throw Error("message must be a short string")
//  }
//
//  return starknet.account.signMessage({
//    domain: {
//      name: "Example DApp",
//      chainId: networkId() === "mainnet-alpha" ? "SN_MAIN" : "SN_GOERLI",
//      version: "0.0.1",
//    },
//    types: {
//      StarkNetDomain: [
//        { name: "name", type: "felt" },
//        { name: "chainId", type: "felt" },
//        { name: "version", type: "felt" },
//      ],
//      Message: [{ name: "message", type: "felt" }],
//    },
//    primaryType: "Message",
//    message: {
//      message,
//    },
//  })
//}

//export const waitForTransaction = async (hash: string) => {
//  const starknet = getStarknet()
//  if (!starknet?.isConnected) {
//    return
//  }
//  return starknet.provider.waitForTransaction(hash)
//}
//
//export const addWalletChangeListener = async (
//  handleEvent: (accounts: string[]) => void,
//) => {
//  const starknet = getStarknet()
//  if (!starknet?.isConnected) {
//    return
//  }
//  starknet.on("accountsChanged", handleEvent)
//}
//
//export const removeWalletChangeListener = async (
//  handleEvent: (accounts: string[]) => void,
//) => {
//  const starknet = getStarknet()
//  if (!starknet?.isConnected) {
//    return
//  }
//  starknet.off("accountsChanged", handleEvent)
//}
//
//export const declare = async (contract: string, classHash: string) => {
//  const starknet = getStarknet()
//  if (!starknet?.isConnected) {
//    throw Error("starknet wallet not connected")
//  }
//
//  return starknet.account.declare({
//    contract,
//    classHash,
//  })
//}
