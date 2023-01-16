import Amount from '../../components/Amount'
import styled from 'styled-components'
import { Address } from '../../../shared/addresses'
import { AddressToken, TokenMetadata, TOKEN_METADATA_URL, TOKEN_IMAGE_URL } from '../../../shared/tokens'
import { DividerTitle } from '../../theme/Typography'
import { FC, useEffect, useState } from 'react'
import { NUM_OF_ZEROS_IN_QUINTILLION, produceZeros } from '@alephium/sdk'
import { getAddressesTokensBalance } from '../../services/backgroundAddresses'

interface TokensListProps {
  addresses: Address[]
}

export const TokensSection: FC<TokensListProps> = ({ addresses }) => {
  const [tokens, setTokens] = useState<AddressToken[]>([])
  const [tokensMetadata, setTokensMetadata] = useState<{
    [key: string]: TokenMetadata
  }>()

  useEffect(() => {
    const addressHashes = addresses.map((a) => a.hash)
    getAddressesTokensBalance(addressHashes).then((tokens) => {
      setTokens(tokens)
    })
  }, [addresses])

  useEffect(() => {
    const fetchTokensMetadata = async () => {
      const response = await fetch(TOKEN_METADATA_URL)
      const data = await response.json()
      setTokensMetadata(data)
    }

    fetchTokensMetadata()
  }, [])

  return (
    <div>
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
