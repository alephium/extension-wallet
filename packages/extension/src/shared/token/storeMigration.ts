import { removeToken, tokenStore } from "./storage"
import { equalToken, tokensFromAlephiumTokenList } from "./utils"
import { Token } from "./type"

export async function migrateTokens() {
  try {
    const allTokens: Token[] = await tokenStore.get()
    for (const token of allTokens) {
      if (tokensFromAlephiumTokenList.findIndex((knownToken) => equalToken(knownToken, token)) !== -1) {
        removeToken(token)
      }
    }
  } catch (e) {
    console.error(e)
  }
}
