import { FC, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import styled from 'styled-components'

import { TransactionPayload } from '../../../shared/transactions'
import Amount from '../../components/Amount'
import { Field, FieldGroup, FieldKey, FieldValue } from '../../components/Fields'
import { routes } from '../../routes'
import { formatTruncatedAddress } from '../../services/addresses'
import { assertNever } from '../../services/assertNever'
import { getAddressName, useAddressMetadata } from '../addresses/addressMetadata.state'
import { ConfirmPageProps, ConfirmScreen } from './ConfirmScreen'
import { TransactionsList } from './transaction/TransactionsList'

interface ApproveTransactionScreenProps extends Omit<ConfirmPageProps, 'onSubmit'> {
  actionHash: string
  payload: TransactionPayload
  onSubmit: (payload: TransactionPayload) => void
}

const LeftPaddedField = styled.div`
  margin-left: 8px;
`

export const titleForTransactions = (payload: TransactionPayload) => {
  switch (payload.type) {
    case 'ALPH_SIGN_TRANSFER_TX':
      return 'Review Send'

    case 'ALPH_SIGN_CONTRACT_CREATION_TX': {
      return 'Review Contract'
    }

    case 'ALPH_SIGN_SCRIPT_TX': {
      return 'Review Script'
    }

    default:
      assertNever(payload)
  }
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  payload,
  defaultAddress,
  actionHash,
  onSubmit,
  ...props
}) => {
  const { metadata } = useAddressMetadata()
  const title = useMemo(() => {
    return titleForTransactions(payload)
  }, [payload])

  let recipient
  let amount

  if (payload.type === 'ALPH_SIGN_TRANSFER_TX') {
    const destination = payload.params.destinations[0]
    amount = BigInt(destination.attoAlphAmount)
    recipient = formatTruncatedAddress(destination.address)
  }

  if (!defaultAddress) {
    return <Navigate to={routes.walletAddresses()} />
  }

  const addressName = getAddressName(defaultAddress.hash, metadata)

  const confirmButtonVariant = 'warn'

  return (
    <ConfirmScreen
      title={title}
      confirmButtonText="Approve"
      confirmButtonVariant={confirmButtonVariant}
      defaultAddress={defaultAddress}
      onSubmit={() => {
        onSubmit(payload)
      }}
      showHeader={false}
      {...props}
    >
      <TransactionsList payload={payload} />
      <FieldGroup>
        <>
          <Field>
            <FieldKey>From</FieldKey>
            <FieldValue>
              <LeftPaddedField>{addressName}</LeftPaddedField>
            </FieldValue>
          </Field>
          {recipient && (
            <Field>
              <FieldKey>To</FieldKey>
              <FieldValue>
                <LeftPaddedField>{recipient}</LeftPaddedField>
              </FieldValue>
            </Field>
          )}
          {amount && (
            <Field>
              <FieldKey>Amount</FieldKey>
              <FieldValue>
                <LeftPaddedField>
                  <Amount value={amount} fullPrecision />
                </LeftPaddedField>
              </FieldValue>
            </Field>
          )}
        </>
      </FieldGroup>
    </ConfirmScreen>
  )
}
