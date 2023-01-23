import { uniqWith } from "lodash-es"
import browser from "webextension-polyfill"

import { getNetwork } from "../network"
import { WalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"
import { addAccounts } from "./store"

export async function migrateWalletAccounts() {
  try {
    const needsMigration = (await browser.storage.local.get("wallet:accounts"))[
      "wallet:accounts"
    ]

    if (!needsMigration) {
      return
    }

    const oldAccounts: WalletAccount[] = JSON.parse(needsMigration)
    const [newAccounts] = await checkAccountsForMigration(oldAccounts)

    await addAccounts(newAccounts)
    return browser.storage.local.remove("wallet:accounts")
  } catch (e) {
    console.error(e)
  }
}

async function checkAccountsForMigration(accounts: WalletAccount[]) {
  // migrate from storing network to just storing networkId
  // populate network back from networkId
  const accountsWithNetworkAndMigrationStatus = await Promise.all(
    accounts.map(
      async (
        account,
      ): Promise<{
        needMigration: boolean
        account: WalletAccount
      }> => {
        let needMigration = false
        try {
          const network = await getNetwork(
            account.networkId || account.networkId,
          )
          if (!network) {
            throw new Error("Network not found")
          }

          // migrations needed
          try {
            // migrate signer.type local_signer to local_secret
            if ((account.signer.type as any) !== "local_secret") {
              // currently there is just one type of signer
              account.signer.type = "local_secret"
              needMigration = true
            }
          } catch {
            // noop
          }

          return {
            account: account,
            needMigration,
          }
        } catch {
          return { account, needMigration }
        }
      },
    ),
  )

  const uniqueAccounts = uniqWith(
    accountsWithNetworkAndMigrationStatus.map(
      (accountWithNetworkAndMigrationStatus) =>
        accountWithNetworkAndMigrationStatus.account,
    ),
    accountsEqual,
  )

  return [
    uniqueAccounts,
    accountsWithNetworkAndMigrationStatus.some(
      (accountWithNetworkAndMigrationStatus) =>
        accountWithNetworkAndMigrationStatus.needMigration,
    ) || accountsWithNetworkAndMigrationStatus.length !== uniqueAccounts.length,
  ] as const
}
