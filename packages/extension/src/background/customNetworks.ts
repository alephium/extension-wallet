import { ExplorerProvider, NodeProvider } from '@alephium/web3'

import { Network, NetworkSchema, NetworkStatus, defaultNetwork, defaultNetworks } from '../shared/networks'
import { Storage } from './storage'

type ArrayOfOrType<T> = T | T[]

interface NetworksState {
  networks: Network[]
  currentNetwork: Network
}

const getNetworksByReadOnly = (networks: Network[], readonly = true): Network[] => {
  return networks.filter((network) => (readonly ? network.readonly : !network.readonly))
}

const networksStore = new Storage<NetworksState>(
  {
    // persist only editable networks
    networks: getNetworksByReadOnly(defaultNetworks, false),
    currentNetwork: defaultNetworks[0]
  },
  'networks'
)

export const getNetworks = async (): Promise<Network[]> => {
  const storedNetworks = await networksStore.getItem('networks')
  const readOnlyNetworks = getNetworksByReadOnly(defaultNetworks, true)

  return [...readOnlyNetworks, ...storedNetworks]
}

export const getNetwork = async (): Promise<Network> => {
  const allNetworks = await getNetworks()
  const currentNetworkId = await getCurrentNetwork()
  return allNetworks.find(({ id }) => id === currentNetworkId) || defaultNetwork
}

export const setCurrentNetwork = async (networkId: string): Promise<{ networkId: string }> => {
  const allNetworks = await getNetworks()
  const network = allNetworks.find(({ id }) => id === networkId) || defaultNetwork

  networksStore.setItem('currentNetwork', network)
  return { networkId: network.id }
}

export const getNetworkStatuses = async (): Promise<NetworkStatus[]> => {
  const allNetworks = await getNetworks()
  return await Promise.all(
    allNetworks.map((network) => {
      return isNetworkHealthy(network).then((healthy) => {
        return { id: network.id, healthy }
      })
    })
  )
}

export const isNetworkHealthy = async (network: Network): Promise<boolean> => {
  const nodeProvider = new NodeProvider(network.nodeUrl)
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)

  try {
    const nodeReleaseVersion = (await nodeProvider.infos.getInfosVersion()).version
    const explorerReleaseVersion = (await explorerProvider.infos.getInfos()).releaseVersion

    return !!nodeReleaseVersion && !!explorerReleaseVersion
  } catch (exception) {
    console.debug('Exception when checking network healthy', exception)
    return false
  }
}

export const getCurrentNetwork = async (): Promise<string> => {
  const currentNetwork = await networksStore.getItem('currentNetwork')
  return currentNetwork.id
}

export const getNetworkById = async (id: string): Promise<Network | undefined> => {
  const allNetworks = await getNetworks()
  return allNetworks.find((network) => network.id === id)
}

export const addNetworks = async (networks: ArrayOfOrType<Network>): Promise<Network[]> => {
  const networksArray = Array.isArray(networks) ? networks : [networks]
  // validate all networks
  await Promise.all(networksArray.map((network) => NetworkSchema.validate(network)))

  const prevNetworks = await getNetworks()

  if (
    prevNetworks.filter(({ readonly }) => readonly).find(({ id }) => networksArray.map(({ id }) => id).includes(id))
  ) {
    throw new Error('Network already exists')
  }

  const newNetworks = [...networksArray, ...prevNetworks]
    .filter(
      // remove duplicates and keep new ones
      (network, index, self) => self.findIndex((n) => n.id === network.id) === index
    )
    .filter((newNetwork) => !newNetwork.readonly) // dont allow readonly networks to be added

  await networksStore.setItem('networks', newNetworks)

  // find difference between prevNetworks and newNetworks
  const addedNetworks = newNetworks.filter(
    (newNetwork) => !prevNetworks.find((prevNetwork) => prevNetwork.id === newNetwork.id)
  )

  return addedNetworks
}

export const removeNetworks = async (networks: ArrayOfOrType<Network['id']>): Promise<Network[]> => {
  const networksArray = Array.isArray(networks) ? networks : [networks]
  const prevNetworks = await getNetworks()
  const newNetworks = prevNetworks.filter(
    (network) => !network.readonly && !networksArray.find((id) => id === network.id)
  )
  await networksStore.setItem('networks', newNetworks)

  // find difference between prevNetworks and newNetworks
  const removedNetworks = prevNetworks.filter(
    (prevNetwork) => !newNetworks.find((newNetwork) => newNetwork.id === prevNetwork.id)
  )

  return removedNetworks
}

export const hasNetwork = async (id: Network['id']) => {
  const networks = await getNetworks()

  return networks.some((network) => network.id === id)
}
