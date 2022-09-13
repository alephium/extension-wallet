import { ArrowUpDown, LayoutTemplate, List, Plus, Settings as SettingsIcon } from 'lucide-react'
import { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { IconButton } from '../../components/buttons/IconButton'
import { Header } from '../../components/Header'
import { routes } from '../../routes'
import { makeClickable } from '../../services/a11y'
import { useSelectedAddress } from '../addresses/addresses.state'
import { NetworkSwitcher } from '../networks/NetworkSwitcher'
import { useWalletState } from './wallet.state'
import { WalletContainerScreenTab } from './WalletContainerScreen'
import AddressFooterContainer, { FooterTab } from './WalletFooter'
import AddressHeader from './WalletHeader'

interface AddressScreenContentProps {
  currentTab: WalletContainerScreenTab
  children?: ReactNode
}

export const WalletContainer: FC<AddressScreenContentProps> = ({ currentTab, children }) => {
  const address = useSelectedAddress()
  const { headerTitle } = useWalletState()
  const navigate = useNavigate()

  if (!address) {
    return <></>
  }

  return (
    <Container header footer>
      <AddressHeader
        buttons={
          <>
            {currentTab === 'assets' && (
              <IconButton size={40}>
                <SettingsIcon
                  size={21}
                  {...makeClickable(() => navigate(routes.settings()), {
                    label: 'Settings',
                    tabIndex: 99
                  })}
                />
              </IconButton>
            )}
            {currentTab !== 'addresses' && <NetworkSwitcher />}
            {currentTab === 'addresses' && (
              <IconButton size={40}>
                <Plus />
              </IconButton>
            )}
          </>
        }
        title={headerTitle}
      />

      {children}

      <AddressFooterContainer>
        <FooterTab to={routes.addressTokens()} isActive={currentTab === 'assets'}>
          <LayoutTemplate />
          <span>Assets</span>
        </FooterTab>
        <FooterTab to={routes.addressActivity()} isActive={currentTab === 'transfers'}>
          <ArrowUpDown />
          <span>Transfers</span>
        </FooterTab>
        <FooterTab to={routes.walletAddresses()} isActive={currentTab === 'addresses'}>
          <List />
          <span>Addresses</span>
        </FooterTab>
      </AddressFooterContainer>
    </Container>
  )
}

export const Container = styled.div<{
  header?: boolean
  footer?: boolean
}>`
  overflow-x: hidden;
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
