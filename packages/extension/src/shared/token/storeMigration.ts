export async function migrateTokens() {
  try {
    const needsMigration = window.localStorage.getItem('core:tokens')
    if (!needsMigration) {
      return
    }

    // We also stored tokens fetched from full node in `core:tokens` in v0.8.0.
    // Maybe we should start from a clean slate.
    window.localStorage.removeItem('core:tokens')
  } catch (e) {
    console.error(e)
  }
}
