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
import { AddressFooter, FooterTab } from "./AddressFooter"
import { AddressHeader } from "./AddressHeader"

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

interface AddressScreenContentProps {
  children?: ReactNode
}

export const AddressContainer: FC<AddressScreenContentProps> = ({
  children,
}) => {
  const address = useSelectedAddress()

  if (!address) {
    return <></>
  }

  return (
    <Container header footer>
      <AddressHeader>
        <Header>
          <Link
            role="button"
            aria-label="Show addresses"
            to={routes.addresses()}
          >
            <ViewListIcon />
          </Link>
          <NetworkSwitcher />
        </Header>
      </AddressHeader>

      {children}

      <AddressFooter>
        <FooterTab to={routes.addressTokens()}>
          <AccountBalanceWalletIcon />
          <span>Assets</span>
        </FooterTab>
        <FooterTab to={routes.addressActivity()}>
          <FormatListBulletedIcon />
          <span>Activity</span>
        </FooterTab>
      </AddressFooter>
    </Container>
  )
}
