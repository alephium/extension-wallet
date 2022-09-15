import { FC, ReactNode } from 'react'

import { assertNever } from '../../services/assertNever'
import { useSelectedAddress } from '../addresses/addresses.state'
import { AddressListScreen } from '../addresses/AddressListScreen'
import WalletAssetsScreen from '../assets/WalletAssetsScreen'
import WalletTransfersScreen from '../transactions/WalletTransfersScreen'
import { WalletContainer } from './WalletContainer'

export type WalletContainerScreenTab = 'assets' | 'addresses' | 'transfers'
interface WalletContainerScreenProps {
  tab: WalletContainerScreenTab
}

export const WalletContainerScreen: FC<WalletContainerScreenProps> = ({ tab }) => {
  const address = useSelectedAddress()

  let body: ReactNode
  if (!address) {
    body = <></>
  } else if (tab === 'assets') {
    body = <WalletAssetsScreen address={address} />
  } else if (tab === 'addresses') {
    body = <AddressListScreen address={address} />
  } else if (tab === 'transfers') {
    body = <WalletTransfersScreen address={address} />
  } else {
    assertNever(tab)
  }

  return <WalletContainer currentTab={tab}>{body}</WalletContainer>
}