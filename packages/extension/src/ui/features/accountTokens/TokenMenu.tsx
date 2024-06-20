import { icons } from "@argent/ui"
import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import { FC } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { useNavigate } from "react-router-dom"

import { VisibilityOff } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../services/blockExplorer.service"
import { useCurrentNetwork } from "../networks/useNetworks"
import { IconWrapper } from "./DeprecatedAccountMenu"
import { useTranslation } from "react-i18next"

const { MoreIcon } = icons

export interface TokenMenuProps {
  tokenId: string
  canHideToken?: boolean
}

export const TokenMenu: FC<TokenMenuProps> = ({
  tokenId,
  canHideToken = true,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentNetwork = useCurrentNetwork()
  const blockExplorerTitle = useBlockExplorerTitle()

  return (
    <>
      <Menu>
        <MenuButton
          aria-label={t("NFT actions")}
          color="neutrals.200"
          colorScheme="transparent"
          padding="1.5"
          fontSize="xl"
          size="auto"
          rounded="full"
          as={Button}
        >
          <MoreIcon />
        </MenuButton>
        <MenuList>
          <CopyToClipboard text={normalizeAddress(tokenId)}>
            <MenuItem>{t("Copy address")}</MenuItem>
          </CopyToClipboard>
          <MenuItem
            onClick={() =>
              openBlockExplorerAddress(currentNetwork, tokenId)
            }
          >
            {t("View on {{ blockExplorerTitle }}", { blockExplorerTitle })}
          </MenuItem>
          {canHideToken && (
            <>
              <MenuItem
                onClick={() => navigate(routes.hideToken(tokenId))}
              >
                <IconWrapper>
                  <VisibilityOff fontSize="inherit" htmlColor="white" />
                </IconWrapper>
                {t("Hide this token")}
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
    </>
  )
}
