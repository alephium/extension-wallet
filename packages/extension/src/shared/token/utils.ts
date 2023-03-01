import defaultTokens from "../../assets/default-tokens.json"
import defaultAlephiumTokens from "../../assets/default-alephium-tokens.json"
import { isEqualId } from "../../ui/services/addresses"
import { BaseToken, Token } from "./type"

export const equalToken = (a: BaseToken, b: BaseToken) =>
  a.networkId === b.networkId && isEqualId(a.id, b.id)

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
  decimals: token.decimals,
}))

export const parsedDefaultAlephiumTokens: Token[] = defaultAlephiumTokens.map((token) => ({
  ...token,
  networkId: token.network,
  decimals: token.decimals,
}))

export const testDappToken = (networkId: string) =>
  defaultTokens.find(
    ({ name, network }) => name === "Test Token" && network === networkId,
  )

export const getFeeToken = (networkId: string) =>
  parsedDefaultTokens.find(
    ({ symbol, networkId: network }) =>
      symbol === "ETH" && network === networkId,
  )

export const dustALPHAmount = BigInt(1000000000000000)

export const minimumALPHAmount = (tokenNums: number) => {
  return dustALPHAmount + BigInt(tokenNums * 100 * 1000000000)
}
