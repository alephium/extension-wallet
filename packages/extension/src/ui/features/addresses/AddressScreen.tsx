import { FC, ReactNode } from 'react'

import { assertNever } from '../../services/assertNever'
import { useSelectedAddress } from '../addresses/addresses.state'
import WalletOverview from '../assets/WalletAssets'
import { AddressActivity } from '../transfers/AddressActivity'
import { AddressContainer } from './AddressContainer'
import { AddressListScreen } from './AddressListScreen'

export type AddressScreenTab = 'assets' | 'addresses' | 'transfers'
interface AddressScreenProps {
  tab: AddressScreenTab
}

export const AddressScreen: FC<AddressScreenProps> = ({ tab }) => {
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

  return <AddressContainer addressScreenTab={tab}>{body}</AddressContainer>
}
