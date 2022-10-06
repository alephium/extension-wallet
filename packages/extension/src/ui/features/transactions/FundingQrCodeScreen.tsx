import { FC, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { CopyTooltip } from '../../components/CopyTooltip'
import { IconBar } from '../../components/IconBar'
import { ContentCopyIcon } from '../../components/Icons/MuiIcons'
import { PageWrapper } from '../../components/Page'
import QrCode from '../../components/QrCode'
import { formatTruncatedAddress } from '../../services/addresses'
import { useDefaultAddress } from '../addresses/addresses.state'
import { useAddressMetadata } from '../addresses/addressMetadata.state'
import DefaultAddressSwitcher from '../addresses/DefaultAddressSwitcher'
import { Address, AddressWrapper } from '../assets/Address'

export const FundingQrCodeScreen: FC = () => {
  const { address: addressParam } = useParams()
  const { metadata: addressesMetadata } = useAddressMetadata()
  const defaultAddress = useDefaultAddress()
  const [address, setAddress] = useState(addressParam === 'undefined' ? defaultAddress?.hash : addressParam)

  return (
    <>
      <IconBar back close />
      <PageWrapper>
        {address && (
          <Container>
            <AddressSwitcher
              title="QR code for address"
              selectedAddressHash={address}
              setSelectedAsDefault
              onAddressSelect={setAddress}
              dimensions={{
                initialItemHeight: 50,
                expandedItemHeight: 60,
                initialListWidth: 210,
                expandedListWidth: 210,
                maxListHeight: 350
              }}
              addressNameStyle={{
                fontWeight: 700,
                fontSize: 18
              }}
            />
            <QrCode size={200} data={address} color={address && addressesMetadata[address].color} />
            <AddressWrapper style={{ marginTop: 20 }}>
              <CopyTooltip copyValue={address} message="Copied!">
                <Address>
                  {formatTruncatedAddress(address)}
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

const AddressSwitcher = styled(DefaultAddressSwitcher)`
  margin-bottom: 30px;
`
