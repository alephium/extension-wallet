import { BarBackButton, CellStack, NavigationBar, ButtonCell, icons } from "@argent/ui"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { isExperimentalSettingsEnabled } from "../../../shared/settings"
import { ArrowCircleDownIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { SettingsMenuItem } from "./SettingsMenuItem"
import { updateTokenListNow } from "../../../shared/token/storage"
import { accountsOnNetwork, discoverAccounts, getAccounts } from "../../services/backgroundAccounts"
import { useCurrentNetwork } from "../networks/useNetworks"
import { LoadingScreen } from "../actions/LoadingScreen"
import { mapWalletAccountsToAccounts } from "../accounts/accounts.state"
import { getDefaultAccountNameByIndex, useAccountMetadata } from "../accounts/accountMetadata.state"
import { useTranslation } from "react-i18next"
import { LedgerAlephium } from "../ledger/utils"
import { addLedgerAccount } from "../accounts/useAddAccount"

const { SearchIcon } = icons

const DeveloperSettings: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const currentNetwork = useCurrentNetwork()
  const { setAccountName } = useAccountMetadata()

  const onTokenListUpdate = useCallback(() => {
    setLoading(true)
    updateTokenListNow()
      .then(() => {
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }, [])

  const discoveryLocalAccounts = useCallback(async () => {
    try {
      const allWalletAccounts = await getAccounts(true)
      const allWalletAccountsOnNetwork = accountsOnNetwork(allWalletAccounts, currentNetwork.id)
      const result = await discoverAccounts(currentNetwork.id)
      if (result === "error") {
        console.log("Error discovering local accounts")
      } else {
        const discoveredAccounts = mapWalletAccountsToAccounts(result.accounts)
        let accountIndex = allWalletAccountsOnNetwork.length
        discoveredAccounts.forEach((account) => {
          setAccountName(account.networkId, account.address, getDefaultAccountNameByIndex(account, accountIndex))
          accountIndex++
        })
      }
    } catch (e) {
      console.log("Error discovering local accounts", e)
    }
  }, [currentNetwork.id, setAccountName])

  const discoveryLedgerAccounts = useCallback(async () => {
    try {
      const allWalletAccounts = await getAccounts(true)
      const allWalletAccountsOnNetwork = accountsOnNetwork(allWalletAccounts, currentNetwork.id)
      let accountIndex = allWalletAccountsOnNetwork.length
      const result = await LedgerAlephium.create().then((ledger) => ledger.discoverActiveAccounts(currentNetwork.id))
      const discoveredAccounts = mapWalletAccountsToAccounts(result)
      for (const account of discoveredAccounts) {
        await addLedgerAccount(account)
        setAccountName(account.networkId, account.address, getDefaultAccountNameByIndex(account, accountIndex))
        accountIndex++
      }
    } catch (e) {
      console.log("Error discovering ledger accounts", e)
    }
  }, [currentNetwork.id, setAccountName])

  const onDiscoverAccounts = useCallback(async () => {
    setLoading(true)
    await discoveryLocalAccounts()
    await discoveryLedgerAccounts()
    setLoading(false)
  }, [setLoading, discoveryLocalAccounts, discoveryLedgerAccounts])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <NavigationBar
        leftButton={<BarBackButton onClick={() => navigate(-1)} />}
        title={t("Developer Settings")}
      />

      <CellStack>
        <SettingsMenuItem
          to={routes.settingsNetworks()}
          title={t("Manage networks")}
        />

        {isExperimentalSettingsEnabled && (
          <SettingsMenuItem
            to={routes.settingsExperimental()}
            title={t("Experimental")}
          />
        )}

        <ButtonCell
          rightIcon={<ArrowCircleDownIcon fontSize="inherit" />}
          onClick={onTokenListUpdate}
          title={t("Update Token List")}
        >
          {t("Update Token List")}
        </ButtonCell>
        <ButtonCell
          rightIcon={<SearchIcon fontSize="inherit" />}
          onClick={onDiscoverAccounts}
          title={t("Discover accounts")}
        >
          {t("Discover accounts")}
        </ButtonCell>
      </CellStack>
    </>
  )
}
export { DeveloperSettings }
