import { getTokenList, removeToken, tokenStore } from "./storage"
import { equalToken } from "./utils"
import { Token } from "./type"

export async function migrateTokens() {
  try {
    const allTokens: Token[] = await tokenStore.get()
    const tokensList = await getTokenList()
    for (const token of allTokens) {
      if (tokensList.findIndex((knownToken) => equalToken(knownToken, token)) !== -1) {
        removeToken(token)
      }
    }
  } catch (e) {
    console.error(e)
  }
}
