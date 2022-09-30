import { FC } from 'react'
import styled from 'styled-components'

import AddressName from '../../components/AddressName'
import { CopyTooltip } from '../../components/CopyTooltip'
import HoverSelect, { HoverSelectItem } from '../../components/HoverSelect'
import { IconBar } from '../../components/IconBar'
import { ContentCopyIcon } from '../../components/Icons/MuiIcons'
import { PageWrapper } from '../../components/Page'
import { QrCode } from '../../components/QrCode'
import { formatTruncatedAddress } from '../../services/addresses'
import { useAddresses, useDefaultAddress } from '../addresses/addresses.state'
import { useAddressMetadata } from '../addresses/addressMetadata.state'
import { Address, AddressWrapper } from '../assets/Address'

export const FundingQrCodeScreen: FC = () => {
  const address = useDefaultAddress()

  const { metadata: addressesMetadata } = useAddressMetadata()
  const { defaultAddress, setDefaultAddress } = useAddresses()

  const handleDefaultAddressSelect = (hash: string) => {
    setDefaultAddress(hash)
  }

  const addressItems: HoverSelectItem[] = Object.entries(addressesMetadata).map(([k, v]) => ({
    Component: (
      <AddressNameContainer>
        <AddressName name={v.name} color={v.color} isDefault={k === defaultAddress?.hash} />
      </AddressNameContainer>
    ),
    value: k
  }))

  return (
    <>
      <IconBar back close />
      <PageWrapper>
        {address && (
          <Container>
            <HoverSelect
              items={addressItems}
              selectedItemValue={defaultAddress?.hash}
              title="Default address"
              onItemClick={handleDefaultAddressSelect}
              dimensions={{
                initialItemHeight: 50,
                expandedItemHeight: 60,
                initialListWidth: 210,
                expandedListWidth: 210,
                maxListHeight: 350
              }}
            />
            <QrCode size={220} data={address.hash} />
            <AddressWrapper style={{ marginBottom: 18 }}>
              <CopyTooltip copyValue={address.hash} message="Copied!">
                <Address>
                  {formatTruncatedAddress(address.hash)}
                  <ContentCopyIcon style={{ fontSize: 12 }} />
                </Address>
              </CopyTooltip>
            </AddressWrapper>
          </Container>
        )}
      </PageWrapper>
    </>
  )
}

const Container = styled.div`
  padding: 0 20px;
  text-align: center;
`

export const AddressNameContainer = styled.div`
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
`
