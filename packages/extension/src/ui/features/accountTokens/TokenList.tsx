import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import { Token } from "../../../shared/token/type"
import { useAppState } from "../../app.state"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenListItemVariant } from "./TokenListItem"
import { TokenListItemContainer } from "./TokenListItemContainer"
import { useTokensWithBalance, TokenDetailsWithBalance } from "./tokens.state"

interface TokenListProps {
  tokenList?: Token[]
  showNewTokenButton?: boolean
  showTokenSymbol?: boolean
  variant?: TokenListItemVariant
  navigateToSend?: boolean
}

export const TokenList: FC<TokenListProps> = ({
  tokenList,
  showNewTokenButton = true,
  showTokenSymbol = false,
  variant,
  navigateToSend = false,
}) => {
  const navigate = useNavigate()
  const account = useSelectedAccount()
  const tokensForAccount = useTokensWithBalance(account)
  if (!account) {
    return null
  }
  const tokens: TokenDetailsWithBalance[] | undefined = tokenList || tokensForAccount.tokenDetails
  tokens.forEach(token => {
    if (token.balance === undefined) {
      token.balance = tokensForAccount.tokenDetails.find(td => td.address === token.address)?.balance
    }
  })
  return (
    <ErrorBoundary
      fallback={
        <ErrorBoundaryFallbackWithCopyError
          message={"Sorry, an error occurred fetching tokens"}
        />
      }
    >
      {tokens.map((token) => (
        <TokenListItemContainer
          key={token.address}
          account={account}
          tokenWithBalance={token}
          variant={variant}
          showTokenSymbol={showTokenSymbol}
          onClick={() => {
            navigate(
              navigateToSend
                ? routes.sendToken(token.address)
                : routes.token(token.address),
            )
          }}
        />
      ))}
    </ErrorBoundary>
  )
}
