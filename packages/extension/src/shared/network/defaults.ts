import { Network } from "./type"

export const DEVNET = {
  id: 'devnet',
  nodeUrl: 'http://127.0.0.1:22973',
  explorerApiUrl: 'http://localhost:9090',
  explorerUrl: 'http://localhost:23000',
  name: 'Devnet'
}

export const defaultNetworks: Network[] = [
  {
    id: 'mainnet',
    nodeUrl: 'https://node.mainnet.alephium.org',
    explorerApiUrl: 'https://backend.mainnet.alephium.org',
    explorerUrl: 'https://explorer.alephium.org',
    name: 'Mainnet'
  },
  {
    id: 'testnet',
    nodeUrl: 'https://node.testnet.alephium.org',
    explorerApiUrl: 'https://backend.testnet.alephium.org',
    explorerUrl: 'https://testnet.alephium.org',
    name: 'Testnet'
  },
  DEVNET
]

export const defaultNetworkIds = defaultNetworks.map(network => network.id)

export const defaultNetwork = defaultNetworks[0]
