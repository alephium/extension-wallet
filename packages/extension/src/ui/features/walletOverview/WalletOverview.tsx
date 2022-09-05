import { Balance } from '@alephium/web3/dist/src/api/api-alephium'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Address } from '../../../shared/Address'
import { getBalances } from '../../services/backgroundAddresses'
import { useAddresses } from '../addresses/addresses.state'
import { getAddressName, useAddressMetadata } from '../addresses/addressMetadata.state'
import { AddressSubHeader } from './AddressSubHeader'

interface AddressTokensProps {
  address: Address
}

export const AddressTokens: FC<AddressTokensProps> = ({ address }) => {
  const { addresses } = useAddresses()
  const [balance, setBalance] = useState<Balance | undefined>(undefined)

  console.log(addresses.map((a) => a.hash))

  useEffect(() => {
    getBalances(addresses.map((a) => a.hash)).then((balances) => {
      console.log(balances)
      /*
      setBalance(
        balances.reduce((acc, b) => acc + b),
        0
      )
      */
    })
  }, [address])

  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.balance), BigInt(0))
  console.log(addresses)
  const totalAvailableBalance = addresses.reduce((acc, address) => acc + address.availableBalance, BigInt(0))
  const totalLockedBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.lockedBalance), BigInt(0))

  console.log(totalBalance)

  return <Container data-testid="address-tokens">{totalBalance.toString()}</Container>
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`
