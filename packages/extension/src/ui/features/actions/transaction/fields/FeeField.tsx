import { FC } from "react"
import styled from "styled-components"

import { Field, FieldKey, LeftPaddedField } from "../../../../components/Fields"
import { useNetworkFeeToken } from "../../../accountTokens/tokens.state"
import { useDisplayTokenAmountAndCurrencyValue } from "../../../accountTokens/useDisplayTokenAmountAndCurrencyValue"

const FeeAmount = styled.div`
  text-align: right;
`
const FeeValue = styled.div`
  text-align: right;
  color: ${({ theme }) => theme.text2};
  font-size: 12px;
  line-height: 14px;
  margin-top: 2px;
`

export interface IFeeField {
  title?: string
  fee: string
  networkId: string
}

export const FeeField: FC<IFeeField> = ({
  title = "Network fee",
  fee,
  networkId,
}) => {
  const feeToken = useNetworkFeeToken(networkId)
  const { displayAmount, displayValue } = useDisplayTokenAmountAndCurrencyValue(
    { amount: fee, tokenId: feeToken?.id },
  )
  if (!feeToken) {
    return null
  }
  return (
    <Field>
      <FieldKey>{title}</FieldKey>
      <LeftPaddedField>
        <FeeAmount>{displayAmount}</FeeAmount>
        {displayValue && <FeeValue>{displayValue}</FeeValue>}
      </LeftPaddedField>
    </Field>
  )
}
