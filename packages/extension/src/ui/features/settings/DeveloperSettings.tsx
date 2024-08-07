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

  const onDiscoverAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const allWalletAccounts = await getAccounts(true)
      const allWalletAccountsOnNetwork = accountsOnNetwork(allWalletAccounts, currentNetwork.id)
      const result = await discoverAccounts(currentNetwork.id)
      if (result === "error") {
        console.log("Error discovering accounts")
        setLoading(false)
      } else {
        const discoveredAccounts = mapWalletAccountsToAccounts(result.accounts)
        let accountIndex = allWalletAccountsOnNetwork.length
        discoveredAccounts.forEach((account) => {
          setAccountName(account.networkId, account.address, getDefaultAccountNameByIndex(account, accountIndex))
          accountIndex++
        })
        setLoading(false)
      }
    } catch (e) {
      console.log("Error discovering accounts", e)
      setLoading(false)
    }
  }, [currentNetwork.id, setAccountName])

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
