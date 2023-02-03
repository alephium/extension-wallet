import { Network } from "./type"

const DEV_ONLY_NETWORKS: Network[] = [
  {
    id: 'devnet',
    nodeUrl: 'http://127.0.0.1:22973',
    explorerApiUrl: 'http://localhost:9090',
    explorerUrl: 'http://localhost:3000',
    name: 'Devnet',
    chainId: 2
  }
]

export const defaultNetworks: Network[] = [
  {
    id: 'mainnet',
    nodeUrl: 'https://wallet.mainnet.alephium.org',
    explorerApiUrl: 'https://backend.mainnet.alephium.org',
    explorerUrl: 'https://explorer.mainnet.alephium.org',
    name: 'Mainnet',
    chainId: 2,
    readonly: true
  },
  {
    id: 'testnet',
    nodeUrl: 'https://wallet.testnet.alephium.org',
    explorerApiUrl: 'https://backend.testnet.alephium.org',
    explorerUrl: 'https://explorer.testnet.alephium.org',
    name: 'Testnet',
    chainId: 1
  },
  {
    id: 'devnet',
    nodeUrl: 'http://127.0.0.1:22973',
    explorerApiUrl: 'http://localhost:9090',
    explorerUrl: 'http://localhost:3000',
    name: 'Devnet',
    chainId: 2
  }
]

export const defaultNetwork = defaultNetworks[2]
