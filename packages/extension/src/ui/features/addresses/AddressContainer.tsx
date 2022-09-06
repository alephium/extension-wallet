import { ArrowUpDown, LayoutTemplate, List, Settings as SettingsIcon } from 'lucide-react'
import { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { Header } from '../../components/Header'
import { IconButton } from '../../components/IconButton'
import { routes } from '../../routes'
import { makeClickable } from '../../services/a11y'
import { NetworkSwitcher } from '../networks/NetworkSwitcher'
import { useSelectedAddress } from './addresses.state'
import { AddressFooter, AddressFooterContainer, FooterTab } from './AddressFooter'
import AddressHeader from './AddressHeader'
import { AddressScreenTab } from './AddressScreen'

interface AddressScreenContentProps {
  addressScreenTab: AddressScreenTab
  children?: ReactNode
}

export const AddressContainer: FC<AddressScreenContentProps> = ({ addressScreenTab, children }) => {
  const address = useSelectedAddress()
  const navigate = useNavigate()

  if (!address) {
    return <></>
  }

  return (
    <Container header footer>
      <AddressHeader
        buttons={
          <>
            {addressScreenTab === 'overview' && (
              <IconButton size={36}>
                <SettingsIcon
                  size={21}
                  {...makeClickable(() => navigate(routes.settings()), {
                    label: 'Settings',
                    tabIndex: 99
                  })}
                />
              </IconButton>
            )}
            <NetworkSwitcher />
          </>
        }
        title={
          addressScreenTab !== 'overview'
            ? addressScreenTab.charAt(0).toUpperCase() + addressScreenTab.slice(1)
            : undefined
        }
      />

      {children}

      <AddressFooterContainer>
        <AddressFooter>
          <FooterTab to={routes.addressTokens()}>
            <LayoutTemplate />
            <span>Overview</span>
          </FooterTab>
          <FooterTab to={routes.walletAddresses()}>
            <List />
            <span>Addresses</span>
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
