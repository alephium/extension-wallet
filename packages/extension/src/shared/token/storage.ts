import * as yup from "yup"

import { ArrayStorage } from "../storage"
import { assertSchema } from "../utils/schema"
import { BaseToken, Token } from "./type"
import { equalToken, knownAlephiumTokens } from "./utils"

export const tokenStore = new ArrayStorage(knownAlephiumTokens, {
  namespace: "core:tokens",
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
  })

export async function addToken(token: Token) {
  await assertSchema(tokenSchema, token)
  return tokenStore.push(token)
}

export async function hasToken(token: BaseToken) {
  await assertSchema(baseTokenSchema, token)
  const [hit] = await tokenStore.get((t) => equalToken(t, token))
  return Boolean(hit)
}

export async function removeToken(token: BaseToken) {
  await assertSchema(baseTokenSchema, token)
  return tokenStore.remove((t) => equalToken(t, token))
}


export async function migrateTokens() {
  console.debug("Migrating tokens")
  const allTokens = await tokenStore.get()

  for (const token of allTokens) {
    if (token.verified === undefined) {
      await removeToken(token)
      const verified = knownAlephiumTokens.findIndex((knownToken) => knownToken.id === token.id) !== -1
      await addToken({ verified, ...token })
    }
  }
}
