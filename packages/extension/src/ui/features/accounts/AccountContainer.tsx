import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"
import styled, { css } from "styled-components"

import { Header } from "../../components/Header"
import {
  AccountBalanceWalletIcon,
  FormatListBulletedIcon,
  ViewListIcon,
} from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { useSelectedAddress } from "../addresses/addresses.state"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { AccountFooter, FooterTab } from "./AccountFooter"
import { AccountHeader } from "./AccountHeader"

export const Container = styled.div<{
  header?: boolean
  footer?: boolean
}>`
  ${({ header = false }) =>
    header &&
    css`
      padding-top: 68px;
    `}
  ${({ footer = false }) =>
    footer &&
    css`
      padding-bottom: 64px;
    `}

  ${Header} > a {
    width: 36px;
    height: 36px;
  }
`

interface AccountScreenContentProps {
  children?: ReactNode
}

export const AccountContainer: FC<AccountScreenContentProps> = ({
  children,
}) => {
  const address = useSelectedAddress()

  if (!address) {
    return <></>
  }

  return (
    <Container header footer>
      <AccountHeader>
        <Header>
          <Link
            role="button"
            aria-label="Show account list"
            to={routes.accounts()}
          >
            <ViewListIcon />
          </Link>
          <NetworkSwitcher />
        </Header>
      </AccountHeader>

      {children}

      <AccountFooter>
        <FooterTab to={routes.accountTokens()}>
          <AccountBalanceWalletIcon />
          <span>Assets</span>
        </FooterTab>
        <FooterTab to={routes.accountActivity()}>
          <FormatListBulletedIcon />
          <span>Activity</span>
        </FooterTab>
      </AccountFooter>
    </Container>
  )
}
