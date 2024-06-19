import { addressFromContractId, ALPH_TOKEN_ID } from "@alephium/web3"
import { FC, useRef, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { ContentCopyIcon, VisibilityOff } from "../../components/Icons/MuiIcons"
import { MoreVertSharp } from "../../components/Icons/MuiIcons"
import { ViewOnBlockExplorerIcon } from "../../components/Icons/ViewOnBlockExplorerIcon"
import Row, { RowCentered } from "../../components/Row"
import { routes } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import { openBlockExplorerAddress } from "../../services/blockExplorer.service"
import { useOnClickOutside } from "../../services/useOnClickOutside"
import { useCurrentNetwork } from "../networks/useNetworks"
import {
  IconWrapper,
  Menu,
  MenuContainer,
  MenuItem,
  MenuItemWrapper,
  Separator,
} from "./DeprecatedAccountMenu"
import { useTranslation } from "react-i18next"

const StyledMenuContainer = styled(MenuContainer)`
  flex: 1;
  text-align: right;
`

const StyledMenu = styled(Menu)`
  top: 120%;
  right: 5%;
`

const MoreVertWrapper = styled(RowCentered)`
  align-items: center;
  border-radius: 50%;
  height: 32px;
  width: 32px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
`

export interface TokenMenuProps {
  tokenId: string
  canHideToken?: boolean
}

export const TokenMenuDeprecated: FC<TokenMenuProps> = ({
  tokenId,
  canHideToken = true,
}) => {
  const { t } = useTranslation()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const currentNetwork = useCurrentNetwork()

  const [isALPH] = useState(tokenId === ALPH_TOKEN_ID)

  useOnClickOutside(ref, () => setMenuOpen(false))

  return (
    <StyledMenuContainer id="token-menu-container" style={{}} ref={ref}>
      <Row style={{ justifyContent: "flex-end" }}>
        <MoreVertWrapper onClick={() => setMenuOpen(!isMenuOpen)}>
          <MoreVertSharp />
        </MoreVertWrapper>
      </Row>
      {isMenuOpen && (
        <StyledMenu>
          <CopyToClipboard
            text={normalizeAddress(tokenId)}
            onCopy={() => setMenuOpen(false)}
          >
            <MenuItemWrapper>
              <MenuItem>
                <ContentCopyIcon fontSize="inherit" htmlColor="white" />
                {t("Copy token ID")}
              </MenuItem>
            </MenuItemWrapper>
          </CopyToClipboard>
          {!isALPH &&
            <CopyToClipboard
              text={addressFromContractId(tokenId)}
              onCopy={() => setMenuOpen(false)}
            >
              <MenuItemWrapper>
                <MenuItem>
                  <ContentCopyIcon fontSize="inherit" htmlColor="white" />
                  {t("Copy token address")}
                </MenuItem>
              </MenuItemWrapper>
            </CopyToClipboard>
          }
          <Separator />
          <MenuItemWrapper
            onClick={() =>
              openBlockExplorerAddress(currentNetwork, addressFromContractId(tokenId))
            }
          >
            {!isALPH &&
              <MenuItem>
                <ViewOnBlockExplorerIcon />
                {t("View on explorer")}
              </MenuItem>
            }
          </MenuItemWrapper>
          {canHideToken && !isALPH && (
            <>
              <Separator />
              <MenuItemWrapper
                onClick={() => navigate(routes.hideToken(tokenId))}
              >
                <MenuItem>
                  <IconWrapper>
                    <VisibilityOff fontSize="inherit" htmlColor="white" />
                  </IconWrapper>
                  {t("Hide this token")}
                </MenuItem>
              </MenuItemWrapper>
            </>
          )}
        </StyledMenu>
      )}
    </StyledMenuContainer>
  )
}
