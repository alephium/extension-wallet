import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Address } from "../../../shared/Address"
import {
  getAddressName,
  useAddressMetadata,
} from "../addresses/addressMetadata.state"
import { AddressSubHeader } from "./AddressSubHeader"
import { TransferButtons } from "./TransferButtons"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

interface AddressTokensProps {
  address: Address
}

export const AddressTokens: FC<AddressTokensProps> = ({ address }) => {
  const navigate = useNavigate()
  const { addressNames, setAddressName } = useAddressMetadata()
  const addressName = getAddressName(address.hash, addressNames)

  return (
    <Container data-testid="address-tokens">
      <AddressSubHeader
        address={address.hash}
        addressName={addressName}
        onChangeName={(name) => setAddressName(address.hash, name)}
      />
      <TransferButtons />
    </Container>
  )
}
