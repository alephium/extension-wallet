import defaultTokens from "../../assets/default-tokens.json"
import { isEqualTokenId } from "../../ui/services/token"
import { BaseToken, Token } from "./type"
import { TokenList, ALPH } from "@alephium/token-list"
import { defaultNetworkIds } from "../network/defaults"

export const equalToken = (a: BaseToken, b: BaseToken) =>
  a.networkId === b.networkId && isEqualTokenId(a.id, b.id)

export const alphTokens: Token[] = defaultNetworkIds.map((networkId) => {
  return {
    ...ALPH,
    "networkId": networkId,
    "logoURI": "https://raw.githubusercontent.com/alephium/alephium-brand-guide/a4680dc86d6061a8d08468ebb42d659ab74db64a/logos/light/Logo-Icon.svg",
    "showAlways": true,
    verified: true
  }
})

export function alphTokenInNetwork(networkId: string) {
  return alphTokens.find((t) => t.networkId === networkId)
}

export const dustALPHAmount = BigInt(1000000000000000)

export const minimumALPHAmount = (tokenNums: number) => {
  return dustALPHAmount + BigInt(tokenNums * 100 * 1000000000)
}

export function convertTokenList(tokenList: TokenList): Token[] {
  const tokens = tokenList.tokens.flatMap((token) => {
    const networkId = defaultNetworkIds[tokenList.networkId]
    if (networkId) {
      return [{ networkId, verified: true, showAlways: true, ...token }]
    } else {
      return []
    }
  })

  return tokens
}

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
  decimals: token.decimals,
}))
