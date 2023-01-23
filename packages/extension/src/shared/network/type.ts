export interface Network {
  id: string
  name: string
  chainId: string
  nodeUrl: string
  explorerUrl?: string
  readonly?: boolean
}

export type NetworkStatus = "ok" | "degraded" | "error" | "unknown"
