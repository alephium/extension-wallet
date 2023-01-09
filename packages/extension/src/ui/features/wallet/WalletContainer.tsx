import { ArrowUpDown, LayoutTemplate, List, Plus, Settings as SettingsIcon, Usb } from 'lucide-react'
import { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { IconButton } from '../../components/buttons/IconButton'
import { routes } from '../../routes'
import { useDefaultAddress } from '../addresses/addresses.state'
import DefaultAddressSwitcher from '../addresses/DefaultAddressSwitcher'
import NetworkSwitcher from '../networks/NetworkSwitcher'
import { useWalletState } from './wallet.state'
import { WalletContainerScreenTab } from './WalletContainerScreen'
import AddressFooterContainer, { FooterTab } from './WalletFooter'
import AddressHeader from './WalletHeader'

interface AddressScreenContentProps {
  currentTab: WalletContainerScreenTab
  children?: ReactNode
}

export const WalletContainer: FC<AddressScreenContentProps> = ({ currentTab, children }) => {
  const address = useDefaultAddress()
  const { headerTitle } = useWalletState()
  //const navigate = useNavigate()

  if (!address) {
    return <></>
  }

  return (
    <Container header footer>
      <AddressHeader
        buttons={
          <>
            {currentTab === 'assets' && (
              <>
                <Link to={routes.settings.path}>
                  <IconButton size={40}>
                    <SettingsIcon />
                  </IconButton>
                </Link>
                <DefaultAddressSwitcher setSelectedAsDefault />
                <NetworkSwitcher />
              </>
            )}
            {currentTab === 'addresses' && (
              <>
                {/* <Link to={routes.newAddress.path}>
                  <IconButton size={40}>
                    <Plus />
                  </IconButton>
                </Link> */}
                <Link to={routes.newLedgerAddress.path}>
                  <IconButton size={40}>
                    <Usb />
                  </IconButton>
                </Link>
              </>
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
`
