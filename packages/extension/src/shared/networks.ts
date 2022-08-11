import { Schema, boolean, object, string } from "yup"

export interface Network {
  id: string
  name: string
  nodeUrl: string
  explorerApiUrl: string
  explorerUrl?: string
  readonly?: boolean
}

export type NetworkStatus = "ok" | "degraded" | "error" | "unknown"

export const defaultNetworks: Network[] = [
  {
    id: "localhost",
    nodeUrl: "http://127.0.0.1:22973",
    explorerApiUrl: "http://localhost:9090",
    explorerUrl: "http://localhost:3000",
    name: "Localhost",
  },
  {
    id: "mainnet",
    nodeUrl: "https://mainnet-wallet.alephium.org",
    explorerApiUrl: "https://mainnet-backend.alephium.org",
    explorerUrl: "https://explorer.alephium.org",
    name: "Mainnet",
  },
  {
    id: "testnet",
    nodeUrl: "https://testnet-wallet.alephium.org",
    explorerApiUrl: "https://testnet-backend.alephium.org",
    explorerUrl: "https://testnet.alephium.org",
    name: "Testnet",
  },
]

const REGEX_URL_WITH_LOCAL =
  /^(https?:\/\/)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/

export const NetworkSchema: Schema<Network> = object()
  .required()
  .shape({
    id: string().required().min(2).max(31),
    name: string().required().min(2).max(128),
    nodeUrl: string()
      .required()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    explorerUrl: string()
      .optional()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    explorerApiUrl: string()
      .required()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    readonly: boolean().optional(),
  })

export const defaultNetwork = defaultNetworks[0]

export const getNetwork = (
  networkId: string,
  allNetworks: Network[],
): Network => {
  return allNetworks.find(({ id }) => id === networkId) || defaultNetwork
}

export const getNetworkById = (
  id: string,
  allNetworks: Network[],
): Network | undefined => {
  return allNetworks.find((network) => network.id === id)
}