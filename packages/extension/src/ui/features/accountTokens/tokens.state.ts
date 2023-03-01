import { ExplorerProvider } from "@alephium/web3"
import { BigNumber } from "ethers"
import { memoize } from "lodash-es"
import { useEffect, useMemo, useRef } from "react"
import useSWR from "swr"
import { getNetwork } from "../../../shared/network"

import { useArrayStorage } from "../../../shared/storage/hooks"
import { tokenStore } from "../../../shared/token/storage"
import { BaseToken, Token } from "../../../shared/token/type"
import { equalToken } from "../../../shared/token/utils"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { useAccount } from "../accounts/accounts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { fetchAllTokensBalance } from "./tokens.service"

export interface TokenDetailsWithBalance extends Token {
  balance?: BigNumber
}

interface UseTokens {
  tokenDetails: TokenDetailsWithBalance[]
  tokenDetailsIsInitialising: boolean
  isValidating: boolean
  error?: any
}

const networkIdSelector = memoize(
  (networkId: string) => (token: Token) => token.networkId === networkId,
)

const feeTokenSelector = memoize(
  (networkId: string) => (token: Token) =>
    token.networkId === networkId && token.symbol === "ALPH",
)

export const getNetworkFeeToken = async (networkId: string) => {
  const [feeToken] = await tokenStore.get(feeTokenSelector(networkId))
  return feeToken ?? null
}

export const useNetworkFeeToken = (networkId?: string) => {
  const [feeToken] = useArrayStorage(
    tokenStore,
    networkId ? feeTokenSelector(networkId) : () => false,
  )
  return feeToken ?? null
}

const tokenSelector = memoize(
  (baseToken: BaseToken) => (token: Token) => equalToken(token, baseToken),
  (baseToken) => getAccountIdentifier({ networkId: baseToken.networkId, address: baseToken.id }),
)

export const useTokensInNetwork = (networkId: string) =>
  useArrayStorage(tokenStore, networkIdSelector(networkId))

export const useToken = (baseToken: BaseToken): Token | undefined => {
  const [token] = useArrayStorage(tokenStore, tokenSelector(baseToken))
  return token
}

/** error codes to suppress - will not bubble error up to parent */
const SUPPRESS_ERROR_STATUS = [429]

export const useTokensWithBalance = (
  account?: BaseWalletAccount,
): UseTokens => {
  const selectedAccount = useAccount(account)
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingTransactionsLengthRef = useRef(pendingTransactions.length)
  const tokensForAccount = useTokens(selectedAccount)

  const {
    data,
    isValidating,
    error: maybeSuppressError,
    mutate,
  } = useSWR(
    // skip if no account selected
    selectedAccount && [
      getAccountIdentifier(selectedAccount),
      "accountTokenBalances",
    ],
    async () => {
      if (!selectedAccount) {
        return
      }

      const balances = await fetchAllTokensBalance(
        tokensForAccount.map((t) => t.id),
        selectedAccount,
      )

      return {
        tokensForAccount,
        balances
      }
    },
    {
      refreshInterval: 30000,
      shouldRetryOnError: (error) => {
        const errorCode = error?.status || error?.errorCode
        const suppressError =
          errorCode && SUPPRESS_ERROR_STATUS.includes(errorCode)
        return suppressError
      },
    },
  )

  const error = useMemo(() => {
    const errorCode =
      maybeSuppressError?.status || maybeSuppressError?.errorCode
    if (!SUPPRESS_ERROR_STATUS.includes(errorCode)) {
      return maybeSuppressError
    }
  }, [maybeSuppressError])

  const tokenDetailsIsInitialising = !error && !data

  // refetch when number of pending transactions goes down
  useEffect(() => {
    if (pendingTransactionsLengthRef.current > pendingTransactions.length) {
      mutate()
    }
    pendingTransactionsLengthRef.current = pendingTransactions.length
  }, [mutate, pendingTransactions.length])

  const tokenDetails = useMemo(() => {
    return (data?.tokensForAccount || [])
      .map((token) => ({
        ...token,
        balance: data?.balances[token.id] ?? BigNumber.from(0),
      }))
      .filter(
        (token) => token.showAlways || (token.balance && token.balance.gt(0)),
      )
  }, [data])

  return {
    tokenDetails,
    tokenDetailsIsInitialising,
    isValidating,
    error,
  }
}

export const useTokens = (
  account?: BaseWalletAccount,
): Token[] => {
  const selectedAccount = useAccount(account)

  const networkId = useMemo(() => {
    return selectedAccount?.networkId ?? ""
  }, [selectedAccount?.networkId])

  const knownTokensInNetwork = useTokensInNetwork(networkId)

  console.log("i m here...", networkId, knownTokensInNetwork)
  const {
    data
  } = useSWR(
    // skip if no account selected
    selectedAccount && [
      getAccountIdentifier(selectedAccount),
      "accountTokens",
    ],
    async () => {
      if (!selectedAccount) {
        return
      }

      const allTokens: Token[] = []

      const network = await getNetwork(selectedAccount.networkId)
      const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
      const tokenIds: string[] = await explorerProvider.addresses.getAddressesAddressTokens(selectedAccount.address)

      for (const tokenId of tokenIds) {
        if (allTokens.findIndex((t) => t.id == tokenId) === -1) {
          const token = {
            id: tokenId,
            networkId: networkId,
            name: tokenId.replace(/[^a-zA-Z]/gi, '').slice(0, 4).toUpperCase(),
            symbol: "",
            decimals: 0
          }

          allTokens.push(token)
        }
      }

      return allTokens
    },
    {
      refreshInterval: 30000,
      shouldRetryOnError: (error) => {
        const errorCode = error?.status || error?.errorCode
        const suppressError =
          errorCode && SUPPRESS_ERROR_STATUS.includes(errorCode)
        return suppressError
      },
    },
  )

  const result = knownTokensInNetwork.filter((network) => network.showAlways)
  const userTokens: Token[] = data || []

  for (const userToken of userTokens) {
    if (result.findIndex((t) => t.id == userToken.id) === -1) {
      const found = knownTokensInNetwork.find((token) => token.id == userToken.id)

      if (found) {
        const token = {
          id: found.id,
          networkId: found.networkId,
          name: found.name,
          symbol: found.symbol,
          decimals: found.decimals,
          logoURI: found.logoURI,
          showAlways: true,
        }
        result.push(token)
      }
    }
  }

  return result
}
