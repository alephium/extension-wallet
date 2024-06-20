import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import { TokenWithBalance } from "../../../shared/token/type"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import ErrorBoundaryFallbackWithCopyError from "../../components/ErrorBoundaryFallbackWithCopyError"
import { routes } from "../../routes"
import { NewTokenButton } from "./NewTokenButton"
import { TokenListItemVariant } from "./TokenListItem"
import { TokenListItemContainer } from "./TokenListItemContainer"
import { Account } from "../accounts/Account"
import { useTranslation } from "react-i18next"

interface TokenListProps {
  account: Account
  tokens: TokenWithBalance[]
  showNewTokenButton?: boolean
  showTokenSymbol?: boolean
  variant?: TokenListItemVariant
  navigateToSend?: boolean
}

export const TokenList: FC<TokenListProps> = ({
  account,
  tokens,
  showNewTokenButton = true,
  showTokenSymbol = false,
  variant
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  if (!account) {
    return null
  }

  tokens.forEach(token => {
    token.balance = tokens.find(td => td.id === token.id)?.balance
  })

  return (
    <ErrorBoundary
      fallback={
        <ErrorBoundaryFallbackWithCopyError
          message={t("Sorry, an error occurred fetching tokens")}
        />
      }
    >
      <Suspense fallback={<NewTokenButton isLoading />}>
        {tokens.map((token) => (
          <TokenListItemContainer
            key={token.id}
            account={account}
            tokenWithBalance={token}
            variant={variant}
            showTokenSymbol={showTokenSymbol}
            onClick={() => {
              // navigate(
              //   navigateToSend
              //     ? routes.sendToken(token.id)
              //     : routes.token(token.id),
              // )
              navigate(routes.sendToken(token.id))
            }}
          />
        ))}
        {showNewTokenButton && <NewTokenButton />}
      </Suspense>
    </ErrorBoundary>
  )
}
