import { Network } from "./type"

const DEV_ONLY_NETWORKS: Network[] = [
  {
    id: "integration",
    name: "Integration",
    chainId: "SN_GOERLI",
    nodeUrl: "https://external.integration.starknet.io",
  },
]

export const defaultNetworks: Network[] = [
  {
    id: "mainnet-alpha",
    name: "Mainnet",
    chainId: "SN_MAIN",
    nodeUrl: "https://alpha-mainnet.starknet.io",
    explorerUrl: "https://voyager.online",
    readonly: true,
  },
  {
    id: "goerli-alpha",
    name: "Testnet",
    chainId: "SN_GOERLI",
    nodeUrl: "https://alpha4.starknet.io",
    explorerUrl: "https://goerli.voyager.online",
    readonly: true,
  },
  {
    id: "goerli-alpha-2",
    name: "Testnet 2",
    chainId: "SN_GOERLI2",
    nodeUrl: "https://alpha4-2.starknet.io",
    explorerUrl: "https://goerli-2.voyager.online/",
  },
  {
    id: "localhost",
    chainId: "SN_GOERLI",
    nodeUrl: "http://localhost:22973",
    explorerUrl: "http://localhost:9090",
    name: "Localhost",
  },
]

export const defaultNetwork = defaultNetworks[1]
