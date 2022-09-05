import { FC, ReactNode } from 'react'

import { assertNever } from '../../services/assertNever'
import { useSelectedAddress } from '../addresses/addresses.state'
import { AddressActivity } from '../transfers/AddressActivity'
import { AddressTokens } from '../walletOverview/WalletOverview'
import { AddressContainer } from './AddressContainer'
import { AddressListScreen } from './AddressListScreen'

interface AddressScreenProps {
  tab: 'assets' | 'activity' | 'addresses'
}

export const AddressScreen: FC<AddressScreenProps> = ({ tab }) => {
  const address = useSelectedAddress()

  let body: ReactNode
  if (!address) {
    body = <></>
  } else if (tab === 'assets') {
    body = <AddressTokens address={address} />
  } else if (tab === 'addresses') {
    body = <AddressListScreen address={address} />
  } else if (tab === 'activity') {
    body = <AddressActivity address={address} />
  } else {
    assertNever(tab)
  }

  return <AddressContainer>{body}</AddressContainer>
}
