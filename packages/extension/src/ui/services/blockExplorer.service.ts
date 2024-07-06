import urlJoin from "url-join"

import { Network } from "../../shared/network"
import { DEVNET } from "../../shared/network/defaults"
import { settingsStore } from "../../shared/settings"
import { defaultBlockExplorers } from "../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../shared/storage/hooks"

export const useBlockExplorerTitle = () => {
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  const settingsBlockExplorer = defaultBlockExplorers[blockExplorerKey]
  return settingsBlockExplorer?.title ?? "Explorer"
}

export const getBlockExplorerUrlForNetwork = (network: Network) => {
  return network.explorerUrl ?? DEVNET.explorerUrl
}

export const openBlockExplorerTransaction = async (
  hash: string,
  network: Network,
) => {
  const blockExplorerUrl = getBlockExplorerUrlForNetwork(network)
  const url = urlJoin(blockExplorerUrl, "tx", hash)
  window.open(url, "_blank")?.focus()
}

export const openBlockExplorerAddress = async (
  network: Network,
  address: string,
) => {
  const blockExplorerUrl = getBlockExplorerUrlForNetwork(network)
  const url = urlJoin(blockExplorerUrl, "addresses", address)
  window.open(url, "_blank")?.focus()
}

export const getExplorerTransactionLink = (explorerUrl: string, hash: string): string =>
  `${explorerUrl}/#/transactions/${hash}`

export const openExplorerTransaction = (explorerUrl: string, hash: string) => {
  window.open(getExplorerTransactionLink(explorerUrl, hash), '_blank')?.focus()
}
