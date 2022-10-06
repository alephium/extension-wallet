import { FC, ReactNode } from 'react'

import { assertNever } from '../../services/assertNever'
import { useDefaultAddress } from '../addresses/addresses.state'
import { AddressListScreen } from '../addresses/AddressListScreen'
import WalletAssetsScreen from '../assets/WalletAssetsScreen'
import WalletTransfersScreen from '../transactions/WalletTransfersScreen'
import { WalletContainer } from './WalletContainer'

export type WalletContainerScreenTab = 'assets' | 'addresses' | 'transfers'
interface WalletContainerScreenProps {
  tab: WalletContainerScreenTab
}

export const WalletContainerScreen: FC<WalletContainerScreenProps> = ({ tab }) => {
  const address = useDefaultAddress()

  let body: ReactNode
  if (!address) {
    body = <></>
  } else if (tab === 'assets') {
    body = <WalletAssetsScreen />
  } else if (tab === 'addresses') {
    body = <AddressListScreen />
  } else if (tab === 'transfers') {
    body = <WalletTransfersScreen />
  } else {
    assertNever(tab)
  }

  return <WalletContainer currentTab={tab}>{body}</WalletContainer>
}
