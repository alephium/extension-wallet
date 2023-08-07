import { TokenList } from "@alephium/token-list"
import * as yup from "yup"
import { ArrayStorage } from "../storage"
import { assertSchema } from "../utils/schema"
import { BaseToken, Token } from "./type"
import { alphTokens, convertTokenList, equalToken } from "./utils"

export const tokenStore = new ArrayStorage([] as Token[], {
  namespace: "core:tokens",
  areaName: "local",
  compare: equalToken,
})

export const tokenListStore = new ArrayStorage(alphTokens, {
  namespace: "core:token-list",
  areaName: "local",
  compare: equalToken,
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
    verified: yup.boolean()
  })

export async function addToken(token: Token) {
  await assertSchema(tokenSchema, token)
  return tokenStore.push({ verified: true, ...token })
}

export async function hasToken(token: BaseToken) {
  await assertSchema(baseTokenSchema, token)
  const tokenList = await getTokenList()
  const tokenListHit = tokenList.find((t) => equalToken(t, token))
  if (tokenListHit) {
    return Boolean(tokenListHit)
  }

  const [hit] = await tokenStore.get((t) => equalToken(t, token))
  return Boolean(hit)
}

export async function removeToken(token: BaseToken) {
  await assertSchema(baseTokenSchema, token)
  return tokenStore.remove((t) => equalToken(t, token))
}

export async function updateTokenList() {
  try {
    const mainnetTokensMetadata = await fetchTokenListByUrl('https://raw.githubusercontent.com/alephium/token-list/master/tokens/mainnet.json')
    const testnetTokensMetadata = await fetchTokenListByUrl('https://raw.githubusercontent.com/alephium/token-list/master/tokens/testnet.json')
    const tokenList = [mainnetTokensMetadata, testnetTokensMetadata].flatMap(convertTokenList)
    await tokenListStore.remove((t) => true)
    await tokenListStore.push(alphTokens.concat(tokenList))
  } catch (e) {
    console.error('Error updating token list', e)
  }
}

export async function getTokenList() {
  const result = await tokenListStore.get()
  if (result.length === 0) {
    await updateTokenList()
    return tokenListStore.get()
  } else {
    return result
  }
}

async function fetchTokenListByUrl(url: string): Promise<TokenList> {
  const response = await fetch(url)
  if (response.ok) {
    return await response.json()
  } else {
    throw new Error(`Failed to fetch token list from ${url}`)
  }
}