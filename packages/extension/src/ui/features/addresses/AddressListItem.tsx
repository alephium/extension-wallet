import { FC, ReactNode } from 'react'
import styled from 'styled-components'

import { CopyTooltip } from '../../components/CopyTooltip'
import { ContentCopyIcon } from '../../components/Icons/MuiIcons'
import { formatTruncatedAddress } from '../../services/addresses'
import { Address } from '../assets/Address'

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
  return (
    <AddressListItemWrapper focus={focus} {...rest}>
      <AddressRow>
        <AddressColumn>
          <AddressName>
            {addressName} <Group>Group {group}</Group>
          </AddressName>
          <AddressHash>
            <CopyTooltip copyValue={address} message="Copied!">
              <Address>
                {formatTruncatedAddress(address)}
                <ContentCopyIcon style={{ fontSize: 12 }} />
              </Address>
            </CopyTooltip>
          </AddressHash>
        </AddressColumn>
        <AddressColumn>{children}</AddressColumn>
      </AddressRow>
    </AddressListItemWrapper>
  )
}

export const AddressListItemWrapper = styled.div<AddressListItemWrapperProps>`
  cursor: pointer;
  background-color: ${({ focus, theme }) => (focus ? theme.bg4 : theme.bg3)};
  border-radius: 9px;
  padding: 20px 16px;
  border: 1px solid ${({ focus }) => (focus ? 'rgba(255, 255, 255, 0.3)' : 'transparent')};
  box-shadow: ${({ focus }) => (focus ? '0 20px 20px rgba(0, 0, 0, 0.25)' : 'none')};
  transition: all 0.15s ease-out;

  height: 150px;
  display: flex;
  gap: 12px;
  align-items: center;
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

const AddressName = styled.h1`
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
  margin: 0 0 5px 0;
`

const AddressHash = styled.div`
  margin-left: -10px;
`

const Group = styled.span`
  font-weight: 300;
  font-size: 10px;
  margin-top: 5px;
`
