import { ALPH_TOKEN_ID, SignTransferTxParams } from "@alephium/web3"
import { H6, P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useMemo } from "react"
import { ReviewTransactionResult, TransactionPayload } from "../../../../shared/actionQueue/types"

import { useDisplayTokenAmountAndCurrencyValue, useDisplayTokensAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import {
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

export interface ReviewedTransferAccessoryProps {
  transaction: TransactionPayload<SignTransferTxParams>
}

export const ReviewedTransferAccessory: FC<ReviewedTransferAccessoryProps> = ({
  transaction,
}) => {
  const amounts = useMemo(() => {
    const result: {id: string, amount: bigint}[] = []
    transaction.destinations.forEach(destination => {
      result.push({id: ALPH_TOKEN_ID, amount: destination.attoAlphAmount})
      destination.tokens?.forEach(token => result.push(token))
    })
    return result
  }, [transaction])
  console.log('Reviewed amounts', amounts)
  const displayAmounts = useDisplayTokensAmountAndCurrencyValue({amounts})
  console.log('Reviewed display amounts', displayAmounts)
  return (
    <Flex direction={"column"} overflow="hidden">
      {displayAmounts.map((amount, index) => 
        <H6
          key={index}
          overflow="hidden"
          textOverflow={"ellipsis"}
          textAlign={"right"}
          color="orange.500"
        >
          {"- "}
          {amount.displayAmount}
        </H6>
      )}
      {/* {displayValue && (
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
      )} */}
    </Flex>
  )
}
