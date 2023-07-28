import { addToken } from "./storage"
import { equalToken, knownAlephiumTokens } from "./utils"
import { Token } from "./type"

export async function migrateTokens() {
  try {
    const needsMigration = window.localStorage.getItem('core:tokens')
    if (!needsMigration) {
      return
    }

    const oldTokens: Token[] = JSON.parse(needsMigration)

    for (const oldToken of oldTokens) {
      if (knownAlephiumTokens.findIndex((knownToken) => equalToken(knownToken, oldToken)) === -1) {
        await addToken({ verified: false, ...oldToken })
      }
    }

    window.localStorage.removeItem('core:tokens')
  } catch (e) {
    console.error(e)
  }
}
