import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

import { attoAlphToFiat } from '../../../shared/utils/amount'
import Amount from '../../components/Amount'
import { getBalances } from '../../services/backgroundAddresses'
import { H1, H3 } from '../../theme/Typography'
import { useAddresses } from '../addresses/addresses.state'
import { useNetworkState } from '../networks/networks.state'
import { useWalletState } from '../wallet/wallet.state'

interface WalletAssetsScreenProps {
  className?: string
}

const WalletAssetsScreen: FC<WalletAssetsScreenProps> = ({ className }) => {
  const { addresses } = useAddresses()
  const [totalBalance, setTotalBalance] = useState<bigint | undefined>(undefined)
  const [fiatBalance, setFiatBalance] = useState<number>()
  const { switcherNetworkId } = useNetworkState()

  useEffect(() => {
    getBalances(addresses.map((a) => a.hash)).then((balances) => {
      setTotalBalance(balances.reduce((acc, b) => acc + BigInt(b.balance), BigInt(0)))
    })
  }, [addresses, switcherNetworkId])

  useEffect(() => {
    useWalletState.setState({ headerTitle: undefined })
  }, [])

  useEffect(() => {
    const fetchFiatPrice = async () => {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=usd`)
      const data = await response.json()
      const latestPrice = attoAlphToFiat(totalBalance, parseFloat(data.alephium['usd']))
      setFiatBalance(latestPrice)
    }

    fetchFiatPrice()
  }, [switcherNetworkId, totalBalance])

  return (
    <div className={className} data-testid="address-tokens">
      <H1>
        <Amount value={totalBalance} fadeDecimals />
      </H1>
      <CenteredH3>
        <Amount fiat={fiatBalance} fiatCurrency={'USD'} fadeDecimals />
      </CenteredH3>
    </div>
  )
}

export default styled(WalletAssetsScreen)`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

const CenteredH3 = styled(H3)`
  text-align: center;
`
