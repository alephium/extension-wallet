import { NUM_OF_ZEROS_IN_QUINTILLION, produceZeros } from '@alephium/sdk'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

import { AddressToken, TokenMetadata } from '../../../shared/tokens'
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

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=usd'
// TODO: Use official Alephium tokens-meta repo
const TOKEN_METADATA_URL = 'https://raw.githubusercontent.com/nop33/token-meta/master/tokens.json'
const TOKEN_IMAGE_URL = 'https://raw.githubusercontent.com/nop33/token-meta/master/images/'

const WalletAssetsScreen: FC<WalletAssetsScreenProps> = ({ className }) => {
  const { addresses } = useAddresses()
  const [totalBalance, setTotalBalance] = useState<bigint | undefined>(undefined)
  const [tokens, setTokens] = useState<AddressToken[]>()
  const [tokensMetadata, setTokensMetadata] = useState<{
    [key: string]: TokenMetadata
  }>()
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
    const fetchTokensMetadata = async () => {
      const response = await fetch(TOKEN_METADATA_URL)
      const data = await response.json()
      setTokensMetadata(data)
    }

    fetchTokensMetadata()
  }, [])

  useEffect(() => {
    const fetchFiatPrice = async () => {
      const response = await fetch(COINGECKO_URL)
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
            {tokens.map(({ id, balance }) => {
              const totalBalance = (BigInt(balance.balance) + BigInt(balance.lockedBalance)).toString()
              const metadata = tokensMetadata ? tokensMetadata[id] : undefined
              const trailingZeros = produceZeros(NUM_OF_ZEROS_IN_QUINTILLION - (metadata?.decimals ?? 0))

              return (
                <TokenItem key={id}>
                  <LeftGroup>
                    <TokenIcon>
                      {metadata?.image ? <TokenLogo src={`${TOKEN_IMAGE_URL}${metadata.image}`} /> : metadata?.symbol}
                    </TokenIcon>
                    <TokenName>{metadata?.name ?? id}</TokenName>
                  </LeftGroup>
                  <TokenAmount
                    token={metadata?.symbol ?? id.slice(0, 3)}
                    value={BigInt(totalBalance + trailingZeros)}
                    fadeDecimals
                  />
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
const TokenItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;

  width: 100%;
  justify-content: space-between;
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

// TODO: Consider merging with TXAmount
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
