import { BarBackButton, CellStack, NavigationBar, ButtonCell, icons } from "@argent/ui"
import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"

import { isExperimentalSettingsEnabled } from "../../../shared/settings"
import { ArrowCircleDownIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { SettingsMenuItem } from "./SettingsMenuItem"
import { updateTokenListNow } from "../../../shared/token/storage"
import { discoverAccounts } from "../../services/backgroundAccounts"
import { useCurrentNetwork } from "../networks/useNetworks"
import { LoadingScreen } from "../actions/LoadingScreen"

const { SearchIcon } = icons

const DeveloperSettings: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const currentNetwork = useCurrentNetwork()

  const onTokenListUpdate = () => {
    setLoading(true)
    updateTokenListNow()
      .then(() => {
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }

  const onDiscoverAccounts = () => {
    setLoading(true)
    discoverAccounts(currentNetwork.id)
      .then(() => {
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <NavigationBar
        leftButton={<BarBackButton onClick={() => navigate(-1)} />}
        title={"Developer Settings"}
      />

      <CellStack>
        <SettingsMenuItem
          to={routes.settingsNetworks()}
          title="Manage networks"
        />

        {isExperimentalSettingsEnabled && (
          <SettingsMenuItem
            to={routes.settingsExperimental()}
            title="Experimental"
          />
        )}

        <ButtonCell
          rightIcon={<ArrowCircleDownIcon fontSize="inherit" />}
          onClick={onTokenListUpdate}
          title="Update Token List"
        >
          Update token list
        </ButtonCell>
        <ButtonCell
          rightIcon={<SearchIcon fontSize="inherit" />}
          onClick={onDiscoverAccounts}
          title="Discover accounts"
        >
          Discover accounts
        </ButtonCell>
      </CellStack>
    </>
  )
}
export { DeveloperSettings }
