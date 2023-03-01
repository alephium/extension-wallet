import { BigNumberish } from "ethers"
import { FC } from "react"

import { prettifyTokenAmount } from "../../../../../shared/token/price"
import { Token } from "../../../../../shared/token/type"
import {
  Field,
  FieldKey,
  FieldValue,
  LeftPaddedField,
} from "../../../../components/Fields"
import { isEqualId } from "../../../../services/addresses"
import { TokenIcon } from "../../../accountTokens/TokenIcon"

export interface ITokenField {
  label: string
  contractAddress?: string
  amount?: BigNumberish
  tokensByNetwork: Token[]
}

export const TokenField: FC<ITokenField> = ({
  label,
  contractAddress,
  amount,
  tokensByNetwork,
}) => {
  if (!contractAddress || !amount) {
    return null
  }
  const token = tokensByNetwork.find(({ id }) =>
    isEqualId(id, contractAddress),
  )
  const displayAmount = token
    ? prettifyTokenAmount({
      amount,
      decimals: token?.decimals,
      symbol: token?.symbol || "Unknown",
    })
    : `${amount} Unknown`
  return (
    <Field>
      <FieldKey>{label}</FieldKey>
      <FieldValue>
        {token && <TokenIcon url={token.logoURI} name={token.name} size={6} />}
        <LeftPaddedField>{displayAmount}</LeftPaddedField>
      </FieldValue>
    </Field>
  )
}
