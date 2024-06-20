import { BigNumber } from "ethers"
import { get } from "lodash-es"
import { useEffect, useMemo, useRef } from "react"
import useSWR, { SWRConfiguration } from "swr"

import { getTokenBalanceForAccount } from "../../../shared/token/balance"
import { Token, TokenWithBalance } from "../../../shared/token/type"
import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { isNumeric } from "../../../shared/utils/number"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { isEqualTokenId } from "../../services/token"
import { Account } from "../accounts/Account"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useTranslation } from "react-i18next"

interface UseTokenBalanceForAccountArgs {
  token?: Token
  account?: Account
  /** Return `data` as {@link TokenBalanceErrorMessage} rather than throwing so the UI can choose if / how to display it to the user without `ErrorBoundary` */
  shouldReturnError?: boolean
}

/**
 * Get the individual token balance for the account, using Multicall if available
 * This will automatically mutate when the number of pending transactions decreases
 */
export const useTokenBalanceForAccount = (
  { token, account, shouldReturnError = false }: UseTokenBalanceForAccountArgs,
  config?: SWRConfiguration,
) => {
  const { t } = useTranslation()
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingTransactionsLengthRef = useRef(pendingTransactions.length)
  const key =
    token && account
      ? [
        getAccountIdentifier(account),
        "balanceOf",
        token.id,
        token.networkId,
      ]
      : null

  const errorToMessage = (
    error: unknown,
    tokenId: string,
  ): TokenBalanceErrorMessage => {
    const errorCode = get(error, "errorCode") as any
    const message = get(error, "message") as any
    if (errorCode === "StarknetErrorCode.UNINITIALIZED_CONTRACT") {
      /** tried to use a contract not found on this network */
      /** message like "Requested contract address 0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4 is not deployed" */
      const contractAddressMatches = message.match(/(0x[0-9a-f]+)/gi)
      const contractAddress = contractAddressMatches?.[0] ?? undefined
      if (contractAddress) {
        if (isEqualTokenId(contractAddress, tokenId)) {
          return {
            message: t("Token not found"),
            description: t("Token with address {{ tokenId }} not deployed on this network", { tokenId }),
          }
        }
        return {
          message: t("Missing contract"),
          description: t("Contract with address {{ contractAddress }} not deployed on this network", { contractAddress }),
        }
      }
      return {
        message: t("Missing contract"),
        description: message,
      }
    } else if (
      errorCode === "StarknetErrorCode.ENTRY_POINT_NOT_FOUND_IN_CONTRACT"
    ) {
      /** not a token */
      return {
        message: t("Invalid token"),
        description: t("This is not a valid token contract"),
      }
    } else if (isNetworkError(errorCode)) {
      /* some other network error */
      return {
        message: t("Network error"),
        description: message,
      }
    } else {
      /* show a console message in dev for any unhandled errors that could be better handled here */
      IS_DEV &&
        console.warn(
          `useTokenBalanceForAccount - ignoring errorCode ${errorCode} with error:`,
          coerceErrorToString(error),
        )
    }
    return {
      message: t("Error"),
      description: message,
    }
  }

  const { data, mutate, ...rest } = useSWR<string | TokenBalanceErrorMessage | undefined>(
    key,
    async () => {
      if (!token || !account) {
        return
      }
      try {
        const balance = await getTokenBalanceForAccount(
          token.id,
          account.toBaseWalletAccount(),
        )
        return balance
      } catch (error) {
        if (shouldReturnError) {
          return errorToMessage(
            error,
            token.id
          )
        } else {
          throw error
        }
      }
    },
    config,
  )

  // refetch when number of pending transactions goes down
  useEffect(() => {
    if (pendingTransactionsLengthRef.current > pendingTransactions.length) {
      mutate()
    }
    pendingTransactionsLengthRef.current = pendingTransactions.length
  }, [mutate, pendingTransactions.length])

  /** as a convenience, also return the token with balance and error message */
  const { tokenWithBalance, errorMessage } = useMemo(() => {
    if (!token) {
      return {
        tokenWithBalance: undefined,
        errorMessage: {
          message: t("Error"),
          description: t("Token is not defined"),
        },
      }
    }
    const tokenWithBalance: TokenWithBalance = {
      ...token,
    }
    let errorMessage: TokenBalanceErrorMessage | undefined
    if (isNumeric(data)) {
      tokenWithBalance.balance = BigNumber.from(data)
    } else {
      errorMessage = data as TokenBalanceErrorMessage
    }
    return {
      tokenWithBalance,
      errorMessage,
    }
  }, [data, token, t])

  return {
    tokenWithBalance,
    errorMessage,
    data,
    mutate,
    ...rest,
  }
}

const isNetworkError = (errorCode: string | number) => {
  if (!isNumeric(errorCode)) {
    return false
  }
  const code = Number(errorCode)
  return [429, 502].includes(code)
}

export interface TokenBalanceErrorMessage {
  message: string
  description: string
}


