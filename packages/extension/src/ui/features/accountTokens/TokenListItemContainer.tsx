import { FC } from "react"
import { TokenWithBalance } from "../../../shared/token/type"

import { Account } from "../accounts/Account"
import { TokenListItem, TokenListItemProps } from "./TokenListItem"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"

export interface TokenListItemContainerProps
  extends Omit<TokenListItemProps, "currencyValue"> {
  tokenWithBalance: TokenWithBalance
  account: Account
}

/**
 * Fetches the token balance or error, currency value and renders them with {@link TokenListItem}
 */

export const TokenListItemContainer: FC<TokenListItemContainerProps> = ({
  tokenWithBalance,
  account,
  ...rest
}) => {

  const currencyValue = useTokenBalanceToCurrencyValue(tokenWithBalance)
  return (
    <TokenListItem
      token={tokenWithBalance}
      currencyValue={currencyValue}
      {...rest}
    />
  )
}
