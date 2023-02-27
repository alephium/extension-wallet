import {
  alephiumProvider,
  checkProviderMetadata,
  knownProviders,
} from "./knownProviders"
import { AlephiumWindowObject, WalletProvider } from "./types"

export function getDefaultAlephiumWallet(): AlephiumWindowObject | undefined {
  return getKnownWallet(alephiumProvider)
}

export function scanKnownWallets(): AlephiumWindowObject[] {
  const wallets: AlephiumWindowObject[] = []
  knownProviders.forEach((provider) => {
    const wallet = getKnownWallet(provider)
    if (wallet !== undefined) {
      wallets.push(wallet)
    }
  })
  return wallets
}

export function getKnownWallet(
  provider: WalletProvider,
): AlephiumWindowObject | undefined {
  const wallet = getWalletObject(provider.id)
  return wallet && checkProviderMetadata(wallet, provider) ? wallet : undefined
}

export function getWalletObject(id: string): AlephiumWindowObject | undefined {
  try {
    const providers = window["alephiumProviders"]
    if (!providers) {
      return undefined
    }
    const wallet = providers[id]
    if (!isWalletObj(wallet)) {
      return undefined
    }
    return wallet
  } catch (error) {}
  return undefined
}

export function isWalletObj(wallet: any): boolean {
  try {
    return (
      wallet &&
      [
        // wallet's must have methods/members, see AlephiumWindowObject
        "id",
        "name",
        "icon",
        "unsafeEnable",
        "isPreauthorized",
        "nodeProvider",
        "explorerProvider",
        "signAndSubmitTransferTx",
        "signAndSubmitDeployContractTx",
        "signAndSubmitExecuteScriptTx",
        "signAndSubmitUnsignedTx",
        "signUnsignedTx",
        "signMessage",
      ].every((key) => key in wallet)
    )
  } catch (err) {}
  return false
}
