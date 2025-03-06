import { TokenList } from "@alephium/token-list"
import * as yup from "yup"
import { ArrayStorage, ObjectStorage } from "../storage"
import { assertSchema } from "../utils/schema"
import { BaseToken, Token, TokenListTokens } from "./type"
import { alphTokens, convertTokenList, equalToken } from "./utils"

export const tokenStore = new ArrayStorage([] as Token[], {
  namespace: "core:tokens",
  areaName: "local",
  compare: equalToken,
})

export const tokenListStore = new ObjectStorage<TokenListTokens>({ tokens: alphTokens } as TokenListTokens, {
  namespace: "core:token-list",
  areaName: "local"
})

export const baseTokenSchema: yup.Schema<BaseToken> = yup
  .object()
  .required("BaseToken is required")
  .shape({
    id: yup.string().required("Id is required"),
    networkId: yup.string().required("Network is required"),
  })

export const tokenSchema: yup.Schema<Token> = baseTokenSchema
  .required("Token is required")
  .shape({
    id: yup.string().required("Id is required"),
    name: yup.string().required("Name is required"),
    symbol: yup.string().required("Symbol is required"),
    decimals: yup.number().required("Decimals is required"),
    logoURI: yup.string().url(),
    showAlways: yup.boolean(),
    description: yup.string(),
    verified: yup.boolean(),
    originChain: yup.string(),
    unchainedLogoURI: yup.string().url()
  })

export async function addToken(token: Token, verified: boolean) {
  await assertSchema(tokenSchema, token)
  return tokenStore.push({ verified, hide: false, ...token })
}

export async function hasToken(token: BaseToken) {
  const result = await getToken(token)
  return Boolean(result)
}

export async function getToken(token: BaseToken) {
  await assertSchema(baseTokenSchema, token)
  const tokenList = await getTokenList()
  const tokenListHit = tokenList.find((t) => equalToken(t, token))
  if (tokenListHit) {
    return tokenListHit
  }

  const [hit] = await tokenStore.get((t) => equalToken(t, token))
  return hit
}

export async function removeToken(token: BaseToken) {
  await assertSchema(baseTokenSchema, token)
  return tokenStore.remove((t) => equalToken(t, token))
}

export async function hideToken(token: Token) {
  await assertSchema(tokenSchema, token)
  return tokenStore.push({ ...token, hide: true })
}

export async function updateTokenList() {
  const now = new Date()
  const tokenListTokens = await tokenListStore.get()

  if (tokenListTokens.updatedAt) {
    const updatedSinceInMinutes = (now.valueOf() - tokenListTokens.updatedAt) / 1000 / 60
    // Update token list at most every hour
    if (updatedSinceInMinutes < 59) {
      console.log(`Skip updating token list, last updated ${updatedSinceInMinutes} minutes ago`)
      return
    }
  }

  await updateTokenListNow()
}

export async function updateTokenListNow() {
  const now = new Date().valueOf()
  try {
    const mainnetTokensMetadata = await fetchTokenListByUrl('https://raw.githubusercontent.com/alephium/token-list/master/tokens/mainnet.json')
    const testnetTokensMetadata = await fetchTokenListByUrl('https://raw.githubusercontent.com/alephium/token-list/master/tokens/testnet.json')
    const tokenList = [mainnetTokensMetadata, testnetTokensMetadata].flatMap(convertTokenList)
    await tokenListStore.set({ updatedAt: now, tokens: alphTokens.concat(tokenList) })
  } catch (e) {
    console.error('Error updating token list', e)
  }
}

export async function getTokenList(): Promise<Token[]> {
  const tokenListTokens = await tokenListStore.get()
  return tokenListTokens.tokens
}

async function fetchTokenListByUrl(url: string): Promise<TokenList> {
  const response = await fetch(url)
  if (response.ok) {
    return await response.json()
  } else {
    throw new Error(`Failed to fetch token list from ${url}`)
  }
}
