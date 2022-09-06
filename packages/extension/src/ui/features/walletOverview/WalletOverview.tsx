import { Balance } from '@alephium/web3/dist/src/api/api-alephium'
import { FC, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { Address } from '../../../shared/Address'
import Amount from '../../components/Amount'
import { getBalances } from '../../services/backgroundAddresses'
import { H1 } from '../../theme/Typography'
import { useAddresses } from '../addresses/addresses.state'
import { useNetworkState } from '../networks/networks.state'

interface WalletOverviewProps {
  address: Address
  className?: string
}

const WalletOverview: FC<WalletOverviewProps> = ({ address, className }) => {
  const theme = useTheme()
  const { addresses } = useAddresses()
  const [balance, setBalance] = useState<bigint | undefined>(undefined)
  const { switcherNetworkId } = useNetworkState()

  console.log(addresses)

  useEffect(() => {
    getBalances(addresses.map((a) => a.hash)).then((balances) => {
      setBalance(balances.reduce((acc, b) => acc + BigInt(b.balance), BigInt(0)))
    })
  }, [address, addresses, switcherNetworkId])

  return (
    <div className={className} data-testid="address-tokens">
      <H1>
        <Amount value={balance} color={theme.text2} />
      </H1>
    </div>
  )
}

export default styled(WalletOverview)`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`
