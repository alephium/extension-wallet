import { ALPH_TOKEN_ID, Number256, number256ToBigint, SignTransferTxParams } from "@alephium/web3"
import { H6, P4 } from "@argent/ui"
import { ColorProps, Flex } from "@chakra-ui/react"
import { FC, useMemo } from "react"
import { ReviewTransactionResult, TransactionPayload } from "../../../../shared/actionQueue/types"

import { useDisplayTokenAmountAndCurrencyValue, useDisplayTokensAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import {
  AmountChanges,
  TokenApproveTransaction,
  TokenMintTransaction,
  TokenTransferTransaction,
} from "../transform/type"

export interface TransferAccessoryProps {
  transaction:
    | TokenTransferTransaction
    | TokenMintTransaction
    | TokenApproveTransaction
}

export const TransferAccessory: FC<TransferAccessoryProps> = ({
  transaction,
}) => {
  const { action, amount, tokenAddress } = transaction
  const { displayAmount, displayValue } = useDisplayTokenAmountAndCurrencyValue(
    { amount, tokenAddress },
  )
  if (!displayAmount) {
    return null
  }
  const prefix =
    action === "SEND" ? <>&minus;</> : action === "RECEIVE" ? <>+</> : null
  return (
    <Flex direction={"column"} overflow="hidden">
      <H6
        overflow="hidden"
        textOverflow={"ellipsis"}
        textAlign={"right"}
        color={action === "RECEIVE" ? "secondary.500" : undefined}
      >
        {prefix}
        {displayAmount}
      </H6>
      {displayValue && (
        <P4
          color="neutrals.400"
          fontWeight={"semibold"}
          overflow="hidden"
          textOverflow={"ellipsis"}
          textAlign={"right"}
        >
          {prefix}
          {displayValue}
        </P4>
      )}
    </Flex>
  )
}

export const TokenAmount = ({
  amount,
  symbol,
  color,
  prefix
}: {
  amount: string,
  symbol: string,
  color: ColorProps['color'],
  prefix: string
}) => {
  return <Flex direction="row-reverse" alignContent="flex-end">
    <H6 key="xxxx" paddingLeft="1">
      {symbol}
    </H6>
    <H6
      overflow="hidden"
      textOverflow={"ellipsis"}
      textAlign={"right"}
      color={color}
    >
      {`${prefix} ${amount}`}
    </H6>
  </Flex>

}

export interface ReviewedTransferAccessoryProps {
  amountChanges: AmountChanges
}

export const ReviewedTransferAccessory: FC<ReviewedTransferAccessoryProps> = ({
  amountChanges,
}) => {
  const amounts = useMemo(() => {
    const result: {id: string, amount: Number256}[] = []
    result.push({id: ALPH_TOKEN_ID, amount: amountChanges.attoAlphAmount})
    Object.entries(amountChanges.tokens).forEach(token => result.push({ id: token[0], amount: token[1]}))
    return result
  }, [amountChanges])
  const displayAmounts = useDisplayTokensAmountAndCurrencyValue({amounts})
  return (
    <Flex direction={"column"} overflow="hidden" alignContent="flex-end">
      {displayAmounts.map((amount, index) => 
        <TokenAmount key={index} amount={amount.displayAmount} symbol={amount.displayTokenId} color="orange.500" prefix="-"/>
      )}
    </Flex>
  )
}
