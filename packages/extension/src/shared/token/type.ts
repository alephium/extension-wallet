import { BigNumber } from "ethers";

export interface BaseToken {
  id: string
  networkId: string
}

export interface BaseTokenWithBalance extends BaseToken {
  balance: BigNumber
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
  originChain?: string
  unchainedLogoURI?: string
  hide?: boolean
}

export interface TokenListTokens {
  updatedAt?: number,
  tokens: Token[]
}

export interface TokenWithBalance extends Token {
  balance?: BigNumber
}
