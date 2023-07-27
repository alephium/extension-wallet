export interface BaseToken {
  id: string
  networkId: string
}

export interface RequestToken extends Omit<BaseToken, "networkId"> {
  id: string
  networkId?: string
  name?: string
  symbol?: string
  decimals?: number
}

export interface Token extends Required<RequestToken> {
  description?: string
  logoURI?: string
  showAlways?: boolean
  verified?: boolean
}
