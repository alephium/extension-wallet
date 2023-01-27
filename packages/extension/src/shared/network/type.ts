export interface Network {
  id: string
  name: string
  chainId: number
  nodeUrl: string
  explorerApiUrl: string
  explorerUrl?: string
  readonly?: boolean
}

export interface NetworkStatus {
  id: Network['id']
  healthy: boolean
}
