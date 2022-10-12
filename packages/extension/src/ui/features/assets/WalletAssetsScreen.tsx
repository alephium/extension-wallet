import { FC, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { AddressToken } from '../../../shared/addresses'
import { attoAlphToFiat } from '../../../shared/utils/amount'
import Amount from '../../components/Amount'
import { getAddressesTokensBalance, getBalances } from '../../services/backgroundAddresses'
import { DividerTitle, H1, H3 } from '../../theme/Typography'
import { useAddresses } from '../addresses/addresses.state'
import { useNetworkState } from '../networks/networks.state'
import { useWalletState } from '../wallet/wallet.state'

interface WalletAssetsScreenProps {
  className?: string
}

// TODO: Get from js-sdk
const NUM_OF_ZEROS_IN_QUINTILLION = 18

const WalletAssetsScreen: FC<WalletAssetsScreenProps> = ({ className }) => {
  const { addresses } = useAddresses()
  const [totalBalance, setTotalBalance] = useState<bigint | undefined>(undefined)
  const [tokens, setTokens] = useState<AddressToken[]>()
  const [fiatBalance, setFiatBalance] = useState<number>()
  const { switcherNetworkId } = useNetworkState()

  useEffect(() => {
    const addressHashes = addresses.map((a) => a.hash)

    getBalances(addressHashes).then((balances) => {
      setTotalBalance(balances.reduce((acc, b) => acc + BigInt(b.balance), BigInt(0)))
    })

    getAddressesTokensBalance(addressHashes).then((tokens) => {
      setTokens(tokens)
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
      <div>
        <H1>
          <Amount value={totalBalance} fadeDecimals />
        </H1>
        <CenteredH3>
          <Amount fiat={fiatBalance} fiatCurrency={'USD'} fadeDecimals />
        </CenteredH3>
      </div>
      {tokens && tokens.length > 0 && (
        <TokensListSection>
          <DividerTitle>Tokens</DividerTitle>
          <TokensList>
            {tokens.map(({ id, ticker, name, balance, decimals, logo }) => {
              const totalBalance = (BigInt(balance.balance) + BigInt(balance.lockedBalance)).toString()

              // TODO: Use produceZeros from js-sdk
              const trailingZeros = '0'.repeat(NUM_OF_ZEROS_IN_QUINTILLION - decimals)

              console.log('logo', logo)

              return (
                <TokenItem key={id}>
                  <LeftGroup>
                    <TokenIcon>{logo ? <TokenLogo src={logo} alt={`${name} logo`} /> : ticker}</TokenIcon>
                    <TokenName>{name}</TokenName>
                  </LeftGroup>
                  <TokenAmount token={ticker} value={BigInt(totalBalance + trailingZeros)} fadeDecimals />
                </TokenItem>
              )
            })}
          </TokensList>
        </TokensListSection>
      )}
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

const TokensListSection = styled.div`
  margin-top: 8px;
`

// TODO: Consider merging with TransactionsWrapper
const TokensList = styled.div``

// TODO: Consider merging with TXDetailsWrapper and TXWrapper
const TokenItem = styled.div<{ highlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  cursor: pointer;

  transition: all 200ms ease-in-out;

  width: 100%;
  justify-content: space-between;

  cursor: pointer;

  ${({ highlighted }) =>
    highlighted &&
    css`
      background-color: rgba(255, 255, 255, 0.1);
    `}

  &:hover, &:focus {
    outline: 0;
    background-color: rgba(255, 255, 255, 0.15);
  }
`

const LeftGroup = styled.div`
  display: flex;
  gap: 17px;
  align-items: center;
  min-width: 0;
`

const TokenIcon = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 45px;
  padding: 10px;
  background-color: ${({ theme }) => theme.bg.highlight};
  color: ${({ theme }) => theme.font.contrast};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`

const TokenAmount = styled(Amount)`
  font-weight: 600;
  font-size: 17px;
  flex-grow: 1;
  flex-shrink: 0;
  text-align: right;
`

// TODO: Consider merging with TXTitle
const TokenName = styled.div`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  margin: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
`

const TokenLogo = styled.img`
  width: 100%;
  height: auto;
`
