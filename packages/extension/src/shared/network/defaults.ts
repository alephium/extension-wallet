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
    nodeUrl: 'https://wallet-v20.mainnet.alephium.org',
    explorerApiUrl: 'https://backend-v113.mainnet.alephium.org',
    explorerUrl: 'https://explorer.mainnet.alephium.org',
    name: 'Mainnet',
    readonly: true
  },
  {
    id: 'testnet',
    nodeUrl: 'https://wallet-v20.testnet.alephium.org',
    explorerApiUrl: 'https://backend-v113.testnet.alephium.org',
    explorerUrl: 'https://explorer.testnet.alephium.org',
    name: 'Testnet',
  },
  DEVNET
]

export const defaultNetworkIds = defaultNetworks.map(network => network.id)

export const defaultNetwork = defaultNetworks[0]
