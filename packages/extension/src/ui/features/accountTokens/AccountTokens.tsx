import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Address } from "../../../shared/Address"
import { Button } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { routes } from "../../routes"
import {
  getAddressName,
  useAddressMetadata,
} from "../addresses/addressMetadata.state"
import { AccountSubHeader } from "./AccountSubheader"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

const ActionContainer = styled(ColumnCenter)`
  width: 100%;
  flex: 2;
  padding: 24px;
  gap: 84px;
`

interface AccountTokensProps {
  address: Address
}

export const AccountTokens: FC<AccountTokensProps> = ({ address }) => {
  const navigate = useNavigate()
  const { addressNames, setAddressName } = useAddressMetadata()
  const addressName = getAddressName(address.hash, addressNames)

  return (
    <Container data-testid="account-tokens">
      <AccountSubHeader
        address={address.hash}
        accountName={addressName}
        onChangeName={(name) => setAddressName(address.hash, name)}
      />
      <ActionContainer>
        <Button type="button" onClick={() => navigate(routes.sendToken())}>
          Send
        </Button>
      </ActionContainer>
    </Container>
  )
}
