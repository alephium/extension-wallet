import { ExplorerProvider, NodeProvider } from "@alephium/web3"
import { Network, NetworkStatus } from "../shared/network"
import { KeyValueStorage } from "../shared/storage"
import { createStaleWhileRevalidateCache } from "./swr"

type SwrCacheKey = string

const swrStorage = new KeyValueStorage<Record<SwrCacheKey, any>>(
  {},
  "cache:swr",
)

// see: https://github.com/jperasmus/stale-while-revalidate-cache#configuration
const swr = createStaleWhileRevalidateCache({
  storage: swrStorage, // can be any object with getItem and setItem methods
  minTimeToStale: 2 * 60e3, // 2 minutes
  maxTimeToLive: 30 * 60e3, // 30 minutes
})

export const getNetworkStatus = async (
  network: Network,
): Promise<NetworkStatus> => {
  return isNetworkHealthy(network).then(healthy => {
    return { id: network.id, healthy }
  })
}

export const getNetworkStatuses = async (
  networks: Network[],
): Promise<Partial<Record<Network["id"], NetworkStatus>>> => {
  const statuses = await Promise.all(
    networks.map(network => getNetworkStatus(network))
  )

  return networks.reduce(
    (acc, network, i) => ({ ...acc, [network.id]: statuses[i] }),
    {},
  )
}

export const isNetworkHealthy = async (network: Network): Promise<boolean> => {
  const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)

  return swr(`${network.id}-network-status`, async () => {
    try {
      const nodeReleaseVersion = (await nodeProvider.infos.getInfosVersion()).version
      const explorerReleaseVersion = (await explorerProvider.infos.getInfos()).releaseVersion

      return !!nodeReleaseVersion && !!explorerReleaseVersion
    } catch (exception) {
      console.debug('Exception when checking network healthy', exception)
      return false
    }
  })
}
