import { FC, useMemo, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { ALPH_SYMBOL, fetchTokensMetadata, TokenMetadata } from '../../../shared/tokens'

import { TransactionPayload } from '../../../shared/transactions'
import Amount from '../../components/Amount'
import { Field, FieldGroup, FieldKey, FieldValue } from '../../components/Fields'
import { routes } from '../../routes'
import { formatTruncatedAddress } from '../../services/addresses'
import { assertNever } from '../../services/assertNever'
import { getAddressName, useAddressMetadata } from '../addresses/addressMetadata.state'
import { ConfirmPageProps, ConfirmScreen } from './ConfirmScreen'
import { TransactionsList } from './transaction/TransactionsList'
import { Token } from '@alephium/web3'

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
    case 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX':
      return 'Review Transfer'

    case 'ALPH_SIGN_AND_SUBMIT_DEPLOY_CONTRACT_TX': {
      return 'Review Contract'
    }

    case 'ALPH_SIGN_AND_SUBMIT_EXECUTE_SCRIPT_TX': {
      return 'Review Script'
    }

    case 'ALPH_SIGN_UNSIGNED_TX': {
      return 'Review Transaction Signing'
    }

    case 'ALPH_SIGN_AND_SUBMIT_UNSIGNED_TX': {
      return 'Review Transaction'
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
  useEffect(() => {
    fetchTokensMetadata().then(setTokensMetadata)
  }, [])

  const { metadata } = useAddressMetadata()
  const title = useMemo(() => {
    return titleForTransactions(payload)
  }, [payload])

  const [tokensMetadata, setTokensMetadata] = useState<{
    [key: string]: TokenMetadata
  }>()

  let recipient
  let amount
  let tokens: Token[] = []
  let recipientName = ''

  if (payload.type === 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX') {
    const destination = payload.params.destinations[0]
    recipient = destination.address
    recipientName = getAddressName(recipient, metadata)
    amount = BigInt(destination.attoAlphAmount)
    tokens = destination.tokens || []
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
              <FieldKey>{ALPH_SYMBOL}</FieldKey>
              <FieldValue>
                <LeftPaddedField>
                  <Amount value={amount} fullPrecision />
                </LeftPaddedField>
              </FieldValue>
            </Field>
          )}
          {tokens.length > 0 && (
            <div>
              {
                tokens.map((token) => {
                  const metadata = tokensMetadata ? tokensMetadata[token.id] : undefined
                  const tokenSymbol = metadata?.symbol ?? token.id.slice(0, 5)
                  return (
                    <Field key={token.id}>
                      <FieldKey>{tokenSymbol}</FieldKey>
                      <FieldValue>
                        <LeftPaddedField>
                          {token.amount.toString()}
                        </LeftPaddedField>
                      </FieldValue>
                    </Field>
                  )
                })
              }
            </div>
          )}
        </>
      </FieldGroup>
    </ConfirmScreen>
  )
}
