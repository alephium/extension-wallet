import { colord } from 'colord'
import { Star, StarOff } from 'lucide-react'
import { FC, ReactNode, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import Amount from '../../components/Amount'
import { CopyTooltip } from '../../components/CopyTooltip'
import { ContentCopyIcon } from '../../components/Icons/MuiIcons'
import { formatTruncatedAddress } from '../../services/addresses'
import { getBalance } from '../../services/backgroundAddresses'
import { Address } from '../assets/Address'
import { useAddressMetadata } from './addressMetadata.state'

export interface IAddressListItem {
  addressName: string
  address: string
  group: number
  focus?: boolean
  children?: ReactNode
  // ...rest
  [x: string]: any
}

type AddressListItemWrapperProps = Pick<IAddressListItem, 'focus'>

export const AddressListItem: FC<IAddressListItem> = ({ addressName, address, group, focus, children, ...rest }) => {
  const { metadata } = useAddressMetadata()
  const [balance, setBalance] = useState('')

  useEffect(() => {
    if (focus) {
      getBalance(address).then((b) => {
        setBalance(b.balance)
      })
    }
  }, [address, focus])

  const addressColor = metadata[address]?.color

  return (
    <AddressListItemWrapper focus={focus} addressColor={addressColor} {...rest}>
      <MainAddressButton className="starButton">
        <Star stroke="white" fill="white" />
      </MainAddressButton>
      <AddressRow>
        <AddressColumn>
          <AddressName>{addressName}</AddressName>
          <AmountContainer>
            <Amount value={BigInt(balance)} fadeDecimals />
          </AmountContainer>
          <AddressHash>
            <CopyTooltip copyValue={address} message="Copied!">
              <Address>
                {formatTruncatedAddress(address)}
                <ContentCopyIcon style={{ fontSize: 12 }} />
              </Address>
            </CopyTooltip>
          </AddressHash>
          <Group>Group {group}</Group>
        </AddressColumn>
        <AddressColumn>{children}</AddressColumn>
      </AddressRow>
    </AddressListItemWrapper>
  )
}

export const AddressListItemWrapper = styled.div<AddressListItemWrapperProps & { addressColor: string }>`
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${({ focus }) => (focus ? '0 20px 20px rgba(0, 0, 0, 0.25)' : 'none')};
  background: ${({ addressColor }) =>
    `linear-gradient(45deg, ${addressColor} 50%, ${colord(addressColor).rotate(40).toHex()} 100%)`};
  transition: all 0.15s ease-out;

  height: 170px;
  display: flex;
  gap: 12px;
  align-items: center;
  * {
    ${({ addressColor, theme }) => {
      const color = colord(addressColor).isDark() ? theme.text1 : theme.bg1
      return css`
        color: ${color} !important;

        svg:not(.lucide-star) * {
          fill: ${color} !important;
        }
      `
    }}
  }
`

const AddressColumn = styled.div`
  display: flex;
  flex-direction: column;
`

const AddressRow = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;
`

const AddressName = styled.h2`
  font-weight: 700;
  font-size: 17px;
  line-height: 18px;
  margin: 0 0 5px 0;
`

const AmountContainer = styled.h1``

const AddressHash = styled.div`
  margin-left: -10px;
`

const Group = styled.span`
  font-weight: 300;
  font-size: 10px;
  margin-top: 5px;
`

const MainAddressButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  height: 40px;
  width: 40px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.3);
  }
`
