import { convertAlphToSet } from '@alephium/sdk'
import { FC, useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Schema, object } from 'yup'

import { inputAmountSchema } from '../../../shared/token/amount'
import { ALPH_IMAGE, ALPH_NAME, TokenMetadata, TOKEN_METADATA_URL, TOKEN_IMAGE_URL } from '../../../shared/tokens'
import Amount from '../../components/Amount'
import { Button } from '../../components/buttons/Button'
import Column, { ColumnCenter } from '../../components/Column'
import { IconBar } from '../../components/IconBar'
import { ControlledInputText } from '../../components/InputText'
import { routes } from '../../routes'
import { addressSchema } from '../../services/addresses'
import { getAddressesTokensBalance, getBalance } from '../../services/backgroundAddresses'
import { sendAlephiumTransferTransaction } from '../../services/transactions'
import { H3 } from '../../theme/Typography'
import { useDefaultAddress } from '../addresses/addresses.state'
import DefaultAddressSwitcher from '../addresses/DefaultAddressSwitcher'
import { TokenIcon } from '../assets/TokenIcon'
import { useYupValidationResolver } from '../settings/useYupValidationResolver'
import { string, array } from 'yup'

export const SendTokenScreen: FC = () => {
  const navigate = useNavigate()
  const resolver = useYupValidationResolver(SendSchema)
  const { address: addressParam } = useParams()
  const defaultAddress = useDefaultAddress()?.hash
  const [address, setAddress] = useState(addressParam === 'undefined' ? defaultAddress : addressParam)
  const [tokensMetadata, setTokensMetadata] = useState<{
    [key: string]: TokenMetadata
  }>()

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    control,
    watch
  } = useForm<SendInput>({
    defaultValues: {
      recipient: '',
      alphAmount: '',
      tokenAmounts: []
    },
    resolver
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tokenAmounts',
  });

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

      // Remove all before append
      remove()

      getAddressesTokensBalance([address]).then((tokens) => {
        remove()

        tokens.forEach(token => {
          if (token.balance.balance > 0) {
            append({ tokenId: token.id, balance: token.balance.balance.toString(), amount: '' })
          }
        })
      })
    }
  }, [address, append, remove])

  useEffect(() => {
    const fetchTokensMetadata = async () => {
      const response = await fetch(TOKEN_METADATA_URL)
      const data = await response.json()
      setTokensMetadata(data)
    }

    fetchTokensMetadata()
  }, [])

  // TODO: web3 add parse number

  const formValues = watch()
  const inputAmount = formValues.alphAmount

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
          <H3>Send Assets</H3>
        </ColumnCenter>
      </IconBar>

      <ColumnCenter>
        <StyledForm
          onSubmit={handleSubmit(({ alphAmount, recipient, tokenAmounts }) => {
            sendAlephiumTransferTransaction(address, recipient, alphAmount)
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
            </AddressSwitcherContainer>

            <InputAndMessages>
              <ControlledInputText
                autoComplete="off"
                autoFocus
                control={control}
                placeholder="Amount"
                name="alphAmount"
                type="number"
                LeftComponent={<TokenIcon name={ALPH_NAME} url={ALPH_IMAGE} size={32} />}
              ></ControlledInputText>
              {inputAmount && isInputAmountGtAvailableBalance && <FormError>Insufficient balance</FormError>}
              {errors.alphAmount && <FormError>{errors.alphAmount.message}</FormError>}
              <FormInfo>
                <span>Available: </span>
                <Amount value={availableBalance} fullPrecision />
              </FormInfo>
            </InputAndMessages>

            {
              <div>
                {fields && fields.length > 0 && (
                  <div>
                    {
                      fields.map((tokenAmount, index) => {
                        const balance = tokenAmount.balance
                        const metadata = tokensMetadata ? tokensMetadata[tokenAmount.id] : undefined
                        const tokenImage = metadata?.image && `${TOKEN_IMAGE_URL}${metadata.image}`
                        const tokenName = metadata?.symbol ?? tokenAmount.tokenId.slice(0, 3)
                        const tokenInputAmount = formValues.tokenAmounts.find((ta) => ta.tokenId === tokenAmount.id)?.amount
                        const isTokenInputAmountGtAvailableBalance = (tokenInputAmount ? convertAlphToSet(tokenInputAmount) : 0) > BigInt(tokenAmount.balance)

                        return (
                          <InputAndMessages key={tokenAmount.id}>
                            <ControlledInputText
                              autoComplete="off"
                              autoFocus
                              control={control}
                              placeholder="Amount"
                              name={`tokenAmounts.${index}.amount`}
                              type="number"
                              LeftComponent={<TokenIcon name={tokenName} url={tokenImage} size={32} />}
                            ></ControlledInputText>
                            {balance && isTokenInputAmountGtAvailableBalance && <FormError>Insufficient balance</FormError>}
                            <FormInfo>
                              <span>Available: {balance}</span>
                            </FormInfo>
                          </InputAndMessages>
                        )
                      })
                    }
                  </div>
                )}
              </div>
            }

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

interface TokenAmount {
  tokenId: string
  amount: string
  balance: string
}

const TokenAmountSchema: Schema<TokenAmount> = object().required().shape({
  tokenId: string().trim().required(),
  amount: inputAmountSchema,
  balance: inputAmountSchema
})

export interface SendInput {
  recipient: string
  alphAmount: string,
  tokenAmounts: TokenAmount[]
}

const SendSchema: Schema<SendInput> = object().required().shape({
  recipient: addressSchema,
  alphAmount: inputAmountSchema,
  tokenAmounts: array().of(TokenAmountSchema).required()
})
