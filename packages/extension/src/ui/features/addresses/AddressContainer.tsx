import { ArrowUpDown, LayoutTemplate } from "lucide-react"
import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"
import styled, { css } from "styled-components"

import { Header } from "../../components/Header"
import { ViewListIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { useSelectedAddress } from "./addresses.state"
import {
  AddressFooter,
  AddressFooterContainer,
  FooterTab,
} from "./AddressFooter"
import { AddressHeader } from "./AddressHeader"

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

      <AddressFooterContainer>
        <AddressFooter>
          <FooterTab to={routes.addressTokens()}>
            <LayoutTemplate />
            <span>Overview</span>
          </FooterTab>
          <FooterTab to={routes.addressActivity()}>
            <ArrowUpDown />
            <span>Transfers</span>
          </FooterTab>
        </AddressFooter>
      </AddressFooterContainer>
    </Container>
  )
}

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
