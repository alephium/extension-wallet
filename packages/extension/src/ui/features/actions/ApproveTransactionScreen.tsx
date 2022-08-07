import { FC, useMemo } from "react"
import { Navigate } from "react-router-dom"
import styled from "styled-components"

import { AlephiumTransactionPayload } from "../../../shared/actionQueue"
import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { routes } from "../../routes"
import {
  getAddressName,
  useAddressMetadata,
} from "../addresses/addressMetadata.state"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { TransactionsList } from "./transaction/TransactionsList"

interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  payload: AlephiumTransactionPayload
  onSubmit: (payload: AlephiumTransactionPayload) => void
}

const LeftPaddedField = styled.div`
  margin-left: 8px;
`

export const titleForTransactions = (payload: AlephiumTransactionPayload) => {
  switch (payload.type) {
    case "ALPH_SIGN_TRANSFER_TX":
      return "Review send"
  }
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  payload,
  selectedAddress,
  actionHash,
  onSubmit,
  ...props
}) => {
  const { addressNames } = useAddressMetadata()
  const title = useMemo(() => {
    return titleForTransactions(payload)
  }, [payload])

  if (!selectedAddress) {
    return <Navigate to={routes.accounts()} />
  }

  const addressName = getAddressName(selectedAddress.hash, addressNames)

  const confirmButtonVariant = "warn"

  return (
    <ConfirmScreen
      title={title}
      confirmButtonText="Approve"
      confirmButtonVariant={confirmButtonVariant}
      selectedAddress={selectedAddress}
      onSubmit={() => {
        onSubmit(payload)
      }}
      showHeader={false}
      {...props}
    >
      <TransactionsList payload={payload} />
      <FieldGroup>
        <Field>
          <FieldKey>From</FieldKey>
          <FieldValue>
            <LeftPaddedField>{addressName}</LeftPaddedField>
          </FieldValue>
        </Field>
      </FieldGroup>
    </ConfirmScreen>
  )
}
