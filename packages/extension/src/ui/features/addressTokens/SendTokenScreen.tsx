import { convertAlphToSet } from "@alephium/sdk"
import { Balance } from "@alephium/sdk/api/alephium"
import { FC, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { Schema, object } from "yup"

import { inputAmountSchema } from "../../../shared/token/amount"
import { Button } from "../../components/Button"
import Column, { ColumnCenter } from "../../components/Column"
import { IconBar } from "../../components/IconBar"
import { StyledControlledInput } from "../../components/InputText"
import { routes } from "../../routes"
import { addressSchema } from "../../services/addresses"
import { getBalance } from "../../services/backgroundAddresses"
import { sendAlephiumTransferTransaction } from "../../services/transactions"
import { H3 } from "../../theme/Typography"
import { useSelectedAddress } from "../addresses/addresses.state"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { TokenIcon } from "./TokenIcon"

export const BalanceText = styled.div`
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  color: ${({ theme }) => theme.text2};
`

export const StyledIconBar = styled(IconBar)`
  align-items: flex-start;
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

export const InputGroupAfter = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
`

export const InputGroupBefore = styled(InputGroupAfter)`
  right: unset;
  left: 16px;
`

export const InputTokenSymbol = styled.span`
  text-transform: uppercase;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: ${({ theme }) => theme.text2};
`

export const FormError = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.red1};
  margin-top: 8px;
  margin-left: 8px;
  text-align: left;
`

export interface SendInput {
  recipient: string
  amount: string
}

const SendSchema: Schema<SendInput> = object().required().shape({
  recipient: addressSchema,
  amount: inputAmountSchema,
})

export const SendTokenScreen: FC = () => {
  const navigate = useNavigate()
  const resolver = useYupValidationResolver(SendSchema)

  const address = useSelectedAddress()?.hash
  const name = "Alephium"
  const symbol = "ALPH"
  const image =
    "https://raw.githubusercontent.com/alephium/alephium-brand-guide/master/logos/light/Logo-Icon.png"

  const {
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, submitCount },
    control,
    watch,
  } = useForm<SendInput>({
    defaultValues: {
      recipient: "",
      amount: "",
    },
    resolver,
  })

  const [balance, setBalance] = useState<Balance | undefined>(undefined)

  useEffect(() => {
    if (address) {
      getBalance(address).then((balance) => {
        setBalance(balance)
      })
    }
  }, [address])

  // TODO: web3 add parse number

  const formValues = watch()
  const inputAmount = formValues.amount

  // TODO: Take fee into consideration
  const isInputAmountGtBalance =
    (inputAmount ? convertAlphToSet(inputAmount) : 0) >=
    (balance ? BigInt(balance.balance) : 0)

  const disableSubmit =
    !isDirty ||
    isSubmitting ||
    (submitCount > 0 && !isDirty) ||
    isInputAmountGtBalance

  if (!address) {
    return <Navigate to={routes.addresses()} />
  }

  return (
    <div style={{ position: "relative" }}>
      <StyledIconBar back>
        <ColumnCenter>
          <H3>Send {symbol}</H3>
          <BalanceText>{`${balance?.balanceHint}`}</BalanceText>
        </ColumnCenter>
      </StyledIconBar>

      <ColumnCenter>
        <StyledForm
          onSubmit={handleSubmit(({ amount, recipient }) => {
            sendAlephiumTransferTransaction(address, recipient, amount)
            navigate(routes.addressTokens())
          })}
        >
          <Column gap="12px">
            <div>
              <StyledControlledInput
                autoComplete="off"
                autoFocus
                control={control}
                placeholder="Amount"
                name="amount"
                type="text"
                onlyNumeric
                style={{ padding: "17px 16px 17px 57px" }}
              >
                <InputGroupBefore>
                  <TokenIcon name={name} url={image} size={32} />
                </InputGroupBefore>
                <InputGroupAfter>
                  <InputTokenSymbol>{symbol}</InputTokenSymbol>
                </InputGroupAfter>
              </StyledControlledInput>
              {inputAmount && isInputAmountGtBalance && (
                <FormError>Insufficient balance</FormError>
              )}
              {errors.amount && <FormError>{errors.amount.message}</FormError>}
            </div>

            <div>
              <StyledControlledInput
                autoComplete="off"
                control={control}
                placeholder="Recipient's address"
                name="recipient"
                type="text"
                style={{
                  paddingRight: "50px",
                  borderRadius: "8px",
                }}
              ></StyledControlledInput>
              {errors.recipient && (
                <FormError>{errors.recipient.message}</FormError>
              )}
            </div>
          </Column>

          <Button disabled={disableSubmit} type="submit">
            Next
          </Button>
        </StyledForm>
      </ColumnCenter>
    </div>
  )
}
