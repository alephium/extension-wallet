import defaultTokens from "../../assets/default-tokens.json"
import defaultAlephiumTokens from "../../assets/default-alephium-tokens.json"
import { isEqualTokenId } from "../../ui/services/token"
import { BaseToken, Token } from "./type"
import { mainnetTokensMetadata, testnetTokensMetadata, TokenList } from "@alephium/token-list"
import { defaultNetworkIds } from "../network/defaults"

export const equalToken = (a: BaseToken, b: BaseToken) =>
  a.networkId === b.networkId && isEqualTokenId(a.id, b.id)

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
  decimals: token.decimals,
}))

export const alephiumTokensFromTokenList: Token[] = [mainnetTokensMetadata, testnetTokensMetadata].flatMap(convertTokenList)

const parsedDefaultAlephiumTokens: Token[] = defaultAlephiumTokens.map((token) => ({
  ...token,
  networkId: token.network,
  decimals: token.decimals,
}))

export const defaultKnownAlephiumTokens = parsedDefaultAlephiumTokens.concat(alephiumTokensFromTokenList)

export const testDappToken = (networkId: string) =>
  defaultTokens.find(
    ({ name, network }) => name === "Test Token" && network === networkId,
  )

export const dustALPHAmount = BigInt(1000000000000000)

export const minimumALPHAmount = (tokenNums: number) => {
  return dustALPHAmount + BigInt(tokenNums * 100 * 1000000000)
}

function convertTokenList(tokenList: TokenList): Token[] {
  return tokenList.tokens.flatMap((token) => {
    const networkId = defaultNetworkIds[tokenList.networkId]
    if (networkId) {
      return [{ networkId, ...token }]
    } else {
      return []
    }
  })
}