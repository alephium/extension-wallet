import { ALPH_TOKEN_ID, Number256 } from "@alephium/web3"
import { H6, P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useMemo } from "react"

import { useDisplayTokenAmountAndCurrencyValue, useDisplayTokensAmountAndCurrencyValue } from "../../accountTokens/useDisplayTokenAmountAndCurrencyValue"
import {
  AmountChanges,
  ExecuteScriptTransformedAlephiumTransaction,
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
    { amount, tokenId: tokenAddress },
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
}: {
  amount: string,
  symbol: string,
}) => {
  return <Flex direction="row-reverse" alignContent="flex-end">
    <H6 key="xxxx" paddingLeft="1">
      {symbol}
    </H6>
    <H6
      overflow="hidden"
      textOverflow={"ellipsis"}
      textAlign={"right"}
      color={amount.startsWith("-") ? "orange.500" : "green.400"}
    >
      {amount}
    </H6>
  </Flex>

}

export interface ReviewedTransferAccessoryProps {
  networkId: string
  amountChanges: AmountChanges
}

export const ReviewedTransferAccessory: FC<ReviewedTransferAccessoryProps> = ({
  networkId,
  amountChanges,
}) => {
  const amounts = useMemo(() => {
    const result: { id: string, amount: Number256 }[] = []
    result.push({ id: ALPH_TOKEN_ID, amount: amountChanges.attoAlphAmount })
    Object.entries(amountChanges.tokens).forEach(token => result.push({ id: token[0], amount: token[1] }))
    return result
  }, [amountChanges])
  const displayAmounts = useDisplayTokensAmountAndCurrencyValue({ networkId, amounts })
  return (
    <Flex direction={"column"} overflow="hidden" alignContent="flex-end">
      {displayAmounts.map((amount, index) =>
        <TokenAmount key={index} amount={amount.displayAmount} symbol={amount.displayTokenId} />
      )}
    </Flex>
  )
}

export const ReviewedScriptTxAccessory: FC<{ networkId: string, transaction: ExecuteScriptTransformedAlephiumTransaction }> = ({
  networkId,
  transaction,
}) => {
  const amounts = useMemo(() => {
    const result: { id: string, amount: Number256 }[] = []
    if (transaction.attoAlphAmount !== undefined) {
      result.push({ id: ALPH_TOKEN_ID, amount: transaction.attoAlphAmount })
    }
    transaction.tokens?.forEach(token => result.push(token))
    return result
  }, [transaction])
  const displayAmounts = useDisplayTokensAmountAndCurrencyValue({ networkId, amounts })

  if (displayAmounts.length === 0) {
    return null
  }

  return (
    <Flex direction={"column"} overflow="hidden" alignContent="flex-end">
      {displayAmounts.map((amount, index) =>
        <TokenAmount key={index} amount={`\u2713 ${amount.displayAmount}`} symbol={amount.displayTokenId} />
      )}
    </Flex>
  )
}
