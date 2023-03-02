import defaultTokens from "../../assets/default-tokens.json"
import { isEqualTokenId } from "../../ui/services/token"
import { BaseToken, Token } from "./type"
import { mainnetTokensMetadata, testnetTokensMetadata, TokenList } from "@alephium/token-list"
import { defaultNetworkIds } from "../network/defaults"
import { ALPH_TOKEN_ID } from "@alephium/web3"

export const equalToken = (a: BaseToken, b: BaseToken) =>
  a.networkId === b.networkId && isEqualTokenId(a.id, b.id)

const knownTokensFromAlephiumTokenList: Token[] =
  [mainnetTokensMetadata, testnetTokensMetadata].flatMap(convertTokenList)

const alphTokens: Token[] = defaultNetworkIds.map((networkId) => {
  return {
    "id": ALPH_TOKEN_ID,
    "name": "ALPH",
    "symbol": "ALPH",
    "decimals": 18,
    "networkId": networkId,
    "logoURI": "https://raw.githubusercontent.com/alephium/alephium-brand-guide/a4680dc86d6061a8d08468ebb42d659ab74db64a/logos/light/Logo-Icon.svg",
    "showAlways": true
  }
})

export const knownAlephiumTokens = alphTokens.concat(knownTokensFromAlephiumTokenList)

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

export const parsedDefaultTokens: Token[] = defaultTokens.map((token) => ({
  ...token,
  networkId: token.network,
  decimals: token.decimals,
}))
