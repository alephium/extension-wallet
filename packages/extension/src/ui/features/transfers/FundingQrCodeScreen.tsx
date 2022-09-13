import { FC } from 'react'
import styled from 'styled-components'

import { CopyTooltip } from '../../components/CopyTooltip'
import { IconBar } from '../../components/IconBar'
import { ContentCopyIcon } from '../../components/Icons/MuiIcons'
import { PageWrapper } from '../../components/Page'
import { QrCode } from '../../components/QrCode'
import { formatTruncatedAddress } from '../../services/addresses'
import { Address, AddressWrapper } from '../assets/Address'
import { useSelectedAddress } from '../wallet/addresses.state'
import { getAddressName, useAddressMetadata } from '../wallet/addressMetadata.state'

const Container = styled.div`
  padding: 0 20px;
  text-align: center;
`

export const AddressName = styled.h1`
  font-style: normal;
  font-weight: 700;
  font-size: 22px;
  line-height: 28px;
  margin: 32px 0 16px 0;
`

export const FundingQrCodeScreen: FC = () => {
  const address = useSelectedAddress()
  const { addressNames } = useAddressMetadata()

  return (
    <>
      <IconBar back close />
      <PageWrapper>
        {address && (
          <Container>
            <QrCode size={220} data={address.hash} />
            <AddressName>{getAddressName(address.hash, addressNames)}</AddressName>
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
