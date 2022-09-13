import { FC, ReactNode } from 'react'

import { assertNever } from '../../services/assertNever'
import WalletOverview from '../assets/WalletAssets'
import { AddressActivity } from '../transfers/AddressActivity'
import { useSelectedAddress } from './addresses.state'
import { AddressListScreen } from './AddressListScreen'
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
    body = <WalletOverview address={address} />
  } else if (tab === 'addresses') {
    body = <AddressListScreen address={address} />
  } else if (tab === 'transfers') {
    body = <AddressActivity address={address} />
  } else {
    assertNever(tab)
  }

  return <WalletContainer addressScreenTab={tab}>{body}</WalletContainer>
}
