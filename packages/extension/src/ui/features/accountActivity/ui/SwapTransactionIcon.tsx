import { Square } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import { TokenIcon } from "../../accountTokens/TokenIcon"
import { isSwapTransaction } from "../transform/is"
import { TransformedTransaction } from "../transform/type"

export interface SwapTransactionIconProps
  extends Omit<ComponentProps<typeof Square>, "size"> {
  transaction: TransformedTransaction
  size: string | number
}

export const SwapTransactionIcon: FC<SwapTransactionIconProps> = ({
  transaction,
  size = 18,
  ...rest
}) => {
  if (!isSwapTransaction(transaction)) {
    console.warn("Not a swap transaction")
    return null
  }
  const fromIconSize = Math.round((Number(size) * 24) / 36)
  const toIconSize = Math.round((Number(size) * 28) / 36)
  const { fromToken, toToken } = transaction
  return (
    <Square size={size} position={"relative"} {...rest}>
      {fromToken && (
        <TokenIcon
          name={fromToken?.name || "?"}
          url={fromToken?.logoURI}
          size={fromIconSize}
          position={"absolute"}
          left={0}
          top={0}
          verified={toToken.verified}
        />
      )}
      <TokenIcon
        name={toToken?.name || "?"}
        url={toToken?.logoURI}
        size={toIconSize}
        position={"absolute"}
        right={0}
        bottom={0}
        verified={toToken.verified}
      />
    </Square>
  )
}
