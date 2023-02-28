import {
  alephiumProvider,
  checkProviderMetadata,
  knownProviders,
} from "./knownProviders"
import { AlephiumWindowObject, providerInitializedEvent, WalletProvider } from "./types"

export function getDefaultAlephiumWallet(): Promise<AlephiumWindowObject | undefined> {
  return getKnownWallet(alephiumProvider)
}

export async function scanKnownWallets(): Promise<AlephiumWindowObject[]> {
  const wallets: AlephiumWindowObject[] = []
  for (const provider of knownProviders) {
    const wallet = await getKnownWallet(provider)
    if (wallet !== undefined) {
      wallets.push(wallet)
    }
  }
  return wallets
}

export function getKnownWallet(
  provider: WalletProvider,
): Promise<AlephiumWindowObject | undefined> {
  return new Promise<AlephiumWindowObject | undefined>(resolve => {
    const fetch = () => {
      const wallet = getWalletObject(provider.id)
      if (!!wallet && checkProviderMetadata(wallet, provider)) {
        resolve(wallet)
      }
    }

    window.addEventListener(providerInitializedEvent(provider.id), fetch)
    fetch()
    setTimeout(() => resolve(undefined), 5000) // We only try for 5 seconds
  })
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
