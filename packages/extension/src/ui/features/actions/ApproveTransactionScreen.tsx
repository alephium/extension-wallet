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
      return 'Review Transfer Signing'

    case 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX':
      return 'Review Transfer'

    case 'ALPH_SIGN_CONTRACT_CREATION_TX': {
      return 'Review Contract Signing'
    }

    case 'ALPH_SIGN_AND_SUBMIT_CONTRACT_CREATION_TX': {
      return 'Review Contract'
    }

    case 'ALPH_SIGN_SCRIPT_TX': {
      return 'Review Script Signing'
    }

    case 'ALPH_SIGN_AND_SUBMIT_SCRIPT_TX': {
      return 'Review Script'
    }

    case 'ALPH_SIGN_UNSIGNED_TX': {
      return 'Review Transaction Signing'
    }

    case 'ALPH_SIGN_HEX_STRING': {
      return 'Review Hex String Signing'
    }

    case 'ALPH_SIGN_MESSAGE': {
      return 'Review Message Signing'
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
  let recipientName = ''

  if (payload.type === 'ALPH_SIGN_TRANSFER_TX') {
    const destination = payload.params.destinations[0]
    recipient = destination.address
    recipientName = getAddressName(recipient, metadata)
    amount = BigInt(destination.attoAlphAmount)
  }

  if (!defaultAddress) {
    return <Navigate to={routes.walletAddresses()} />
  }

  const addressName = getAddressName(defaultAddress.hash, metadata)

  return (
    <ConfirmScreen
      title={title}
      confirmButtonText="Approve"
      confirmButtonVariant="warn"
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
                <LeftPaddedField>
                  {recipientName && recipientName !== 'Unnamed Address'
                    ? recipientName
                    : formatTruncatedAddress(recipient)}
                </LeftPaddedField>
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
