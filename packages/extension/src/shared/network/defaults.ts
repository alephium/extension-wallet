import { Network } from "./type"

export const DEVNET = {
  id: 'devnet',
  nodeUrl: 'http://127.0.0.1:22973',
  explorerApiUrl: 'http://localhost:9090',
  explorerUrl: 'http://localhost:23000',
  name: 'Devnet'
}

const DEV_ONLY_NETWORKS: Network[] = [DEVNET]

export const defaultNetworks: Network[] = [
  {
    id: 'mainnet',
    nodeUrl: 'https://wallet.mainnet.alephium.org',
    explorerApiUrl: 'https://backend.mainnet.alephium.org',
    explorerUrl: 'https://explorer.mainnet.alephium.org',
    name: 'Mainnet',
    readonly: true
  },
  {
    id: 'testnet',
    nodeUrl: 'https://wallet-v17.testnet.alephium.org',
    explorerApiUrl: 'https://backend-v112-v17.testnet.alephium.org',
    explorerUrl: 'https://explorer-v112-v17.testnet.alephium.org',
    name: 'Testnet',
  },
  DEVNET
]

export const defaultNetworkIds = defaultNetworks.map(network => network.id)

export const defaultNetwork = defaultNetworks[2]
