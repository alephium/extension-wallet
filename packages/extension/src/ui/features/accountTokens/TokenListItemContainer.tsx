import { FC } from "react"

import { Account } from "../accounts/Account"
import { TokenListItem, TokenListItemProps } from "./TokenListItem"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { TokenDetailsWithBalance } from "./tokens.state"

export interface TokenListItemContainerProps
  extends Omit<TokenListItemProps, "currencyValue"> {
  tokenWithBalance: TokenDetailsWithBalance
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
  const shouldShow = tokenWithBalance.showAlways
  if (!shouldShow) {
    return null
  }
  return (
    <TokenListItem
      token={tokenWithBalance}
      currencyValue={currencyValue}
      {...rest}
    />
  )
}
