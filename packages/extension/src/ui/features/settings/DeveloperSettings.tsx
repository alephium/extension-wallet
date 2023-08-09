import { BarBackButton, CellStack, NavigationBar } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { isExperimentalSettingsEnabled } from "../../../shared/settings"
import { ArrowCircleDownIcon, CheckCircleIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { SettingsMenuItem } from "./SettingsMenuItem"
import styled from "styled-components"
import { IconButton } from "../../components/Button"
import { updateTokenListNow } from "../../../shared/token/storage"

const StyledIconButton = styled(IconButton)`
  margin-top: 16px;
  width: auto;
`

const DeveloperSettings: FC = () => {
  const navigate = useNavigate()
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

        <div>
          <StyledIconButton
            size="s"
            icon={<ArrowCircleDownIcon fontSize="inherit" />}
            clickedIcon={<CheckCircleIcon fontSize="inherit" />}
            clickedTimeout={5 * 60 * 1000}
            onClick={updateTokenListNow}
          >
            Update Token List
          </StyledIconButton>
        </div>
      </CellStack>
    </>
  )
}
export { DeveloperSettings }
