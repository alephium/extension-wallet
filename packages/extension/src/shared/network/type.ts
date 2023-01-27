export interface Network {
  id: string
  name: string
  chainId: number
  nodeUrl: string
  explorerApiUrl: string
  explorerUrl?: string
  readonly?: boolean
}

export type NetworkStatus = "ok" | "degraded" | "error" | "unknown"
