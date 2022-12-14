import { convertAlphToSet } from '@alephium/sdk'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Schema, object } from 'yup'

import { inputAmountSchema } from '../../../shared/token/amount'
import Amount from '../../components/Amount'
import { Button } from '../../components/buttons/Button'
import Column, { ColumnCenter } from '../../components/Column'
import { IconBar } from '../../components/IconBar'
import { ControlledInputText } from '../../components/InputText'
import { routes } from '../../routes'
import { addressSchema } from '../../services/addresses'
import { getBalance } from '../../services/backgroundAddresses'
import { sendAlephiumTransferTransaction } from '../../services/transactions'
import { H3 } from '../../theme/Typography'
import { useDefaultAddress } from '../addresses/addresses.state'
import DefaultAddressSwitcher from '../addresses/DefaultAddressSwitcher'
import { TokenIcon } from '../assets/TokenIcon'
import { useYupValidationResolver } from '../settings/useYupValidationResolver'

const name = 'Alephium'
const symbol = 'ALPH'
const image = 'https://raw.githubusercontent.com/alephium/alephium-brand-guide/master/logos/light/Logo-Icon.png'

export const SendTokenScreen: FC = () => {
  const navigate = useNavigate()
  const resolver = useYupValidationResolver(SendSchema)
  const { address: addressParam } = useParams()
  const defaultAddress = useDefaultAddress()?.hash
  const [address, setAddress] = useState(addressParam === 'undefined' ? defaultAddress : addressParam)

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    control,
    watch
  } = useForm<SendInput>({
    defaultValues: {
      recipient: '',
      amount: ''
    },
    resolver
  })

  const [availableBalance, setAvailableBalance] = useState(BigInt(0))

  useEffect(() => {
    if (address) {
      getBalance(address).then((balance) => {
        if (balance?.balance) {
          setAvailableBalance(
            balance.lockedBalance ? BigInt(balance.balance) - BigInt(balance.lockedBalance) : BigInt(balance.balance)
          )
        }
      })
    }
  }, [address])

  // TODO: web3 add parse number

  const formValues = watch()
  const inputAmount = formValues.amount

  // TODO: Take fee into consideration
  const isInputAmountGtAvailableBalance = (inputAmount ? convertAlphToSet(inputAmount) : 0) >= availableBalance

  const disableSubmit = !isDirty || isSubmitting || (submitCount > 0 && !isDirty) || isInputAmountGtAvailableBalance

  if (!address) {
    return <Navigate to={routes.walletAddresses()} />
  }

  return (
    <div style={{ position: 'relative' }}>
      <IconBar back>
        <ColumnCenter>
          <H3>Send {symbol}</H3>
        </ColumnCenter>
      </IconBar>

      <ColumnCenter>
        <StyledForm
          onSubmit={handleSubmit(({ amount, recipient }) => {
            sendAlephiumTransferTransaction(address, recipient, amount)
            navigate(routes.addressTokens())
          })}
        >
          <Column gap="12px">
            <AddressSwitcherContainer>
              <DefaultAddressSwitcher
                title="From address"
                selectedAddressHash={address}
                setSelectedAsDefault
                onAddressSelect={setAddress}
                dimensions={{
                  initialItemHeight: 60,
                  expandedItemHeight: 66,
                  initialListWidth: '100%',
                  expandedListWidth: '100%',
                  maxListHeight: 200
                }}
                addressNameStyle={{
                  fontWeight: 700,
                  fontSize: 16
                }}
                alignText="start"
                alwaysShowTitle={true}
                borderRadius={9}
              />
              <FormInfo>
                <span>Available: </span>
                <Amount value={availableBalance} fullPrecision />
              </FormInfo>
            </AddressSwitcherContainer>
            <InputAndMessages>
              <ControlledInputText
                autoComplete="off"
                autoFocus
                control={control}
                placeholder="Amount"
                name="amount"
                type="number"
                LeftComponent={<TokenIcon name={name} url={image} size={32} />}
              ></ControlledInputText>
              {inputAmount && isInputAmountGtAvailableBalance && <FormError>Insufficient balance</FormError>}
              {errors.amount && <FormError>{errors.amount.message}</FormError>}
            </InputAndMessages>

            <InputAndMessages>
              <ControlledInputText
                autoComplete="off"
                control={control}
                placeholder="Recipient's address"
                name="recipient"
                type="text"
              ></ControlledInputText>
              {errors.recipient && <FormError>{errors.recipient.message}</FormError>}
            </InputAndMessages>
          </Column>

          <Button disabled={disableSubmit} type="submit">
            Next
          </Button>
        </StyledForm>
      </ColumnCenter>
    </div>
  )
}

export const BalanceText = styled.div`
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  color: ${({ theme }) => theme.font.secondary};
`

export const StyledForm = styled.form`
  padding: 24px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`

const AddressSwitcherContainer = styled.div`
  height: 50px;
  margin-bottom: 20px;
  width: 100%;
`

const InputAndMessages = styled.div`
  margin-bottom: 15px;
`

export const InputTokenSymbol = styled.span`
  text-transform: uppercase;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: ${({ theme }) => theme.font.secondary};
`

const FormError = styled.p`
  position: absolute;
  left: 0;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.global.alert};
  margin-top: 8px;
  margin-left: 30px;
  text-align: left;
`

const FormInfo = styled.p`
  position: absolute;
  right: 0;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.font.secondary};
  margin-top: 8px;
  margin-right: 30px;
  text-align: right;
`

export interface SendInput {
  recipient: string
  amount: string
}

const SendSchema: Schema<SendInput> = object().required().shape({
  recipient: addressSchema,
  amount: inputAmountSchema
})
