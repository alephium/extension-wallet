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
  verified?: boolean
  originChain?: string
  unchainedLogoURI?: string
}

export interface TokenListTokens {
  updatedAt?: number,
  tokens: Token[]
}

export interface TokenWithBalance extends Token {
  balance?: BigNumber
}

export interface HiddenToken {
  id: string
  networkId: string
}
