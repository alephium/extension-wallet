import { ExplorerProvider, NodeProvider } from "@alephium/web3"
import { BigNumber } from "ethers"
import { memoize } from "lodash-es"
import { useEffect, useMemo, useRef } from "react"
import useSWR from "swr"
import useSWRImmutable from 'swr/immutable'
import { getNetwork, Network } from "../../../shared/network"

import { useArrayStorage } from "../../../shared/storage/hooks"
import { addToken, tokenStore } from "../../../shared/token/storage"
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

export const devnetTokenSymbol = (baseToken: { id: string }): string => {
  return baseToken.id.replace(/[^a-zA-Z]/gi, '').slice(0, 4).toUpperCase()
}

export const devnetToken = (baseToken: BaseToken): Token => {
  const symbol = devnetTokenSymbol(baseToken)
  return {
    id: baseToken.id,
    networkId: baseToken.networkId,
    name: `Dev ${symbol}`,
    symbol: symbol,
    decimals: 0
  }
}

export const useToken = (baseToken: BaseToken): Token | undefined => {
  const [token] = useArrayStorage(tokenStore, tokenSelector(baseToken))
  if (token === undefined && baseToken.networkId === 'devnet') {
    return devnetToken(baseToken)
  }
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

  const {
    data: userTokens
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

      const allTokens: BaseToken[] = []
      const network = await getNetwork(networkId)
      const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
      const tokenIds: string[] = await explorerProvider.addresses.getAddressesAddressTokens(selectedAccount.address)

      for (const tokenId of tokenIds) {
        if (allTokens.findIndex((t) => t.id == tokenId) === -1) {
          allTokens.push({ id: tokenId, networkId: networkId })
        }
      }

      return allTokens
    },
    {
      refreshInterval: 30000,
      shouldRetryOnError: (error: any) => {
        const errorCode = error?.status || error?.errorCode
        const suppressError =
          errorCode && SUPPRESS_ERROR_STATUS.includes(errorCode)
        return suppressError
      },
    }
  )

  const {
    data: userShownTokens
  } = useSWRImmutable(
    selectedAccount && [
      getAccountIdentifier(selectedAccount),
      userTokens,
      "accountShownTokens",
    ],
    async () => {
      const result = knownTokensInNetwork.filter((network) => network.showAlways).map(t => [t, -1] as [Token, number])
      const network = await getNetwork(networkId)

      let foundOnFullNodeIndex = knownTokensInNetwork.length + 1
      for (const userToken of userTokens || []) {
        if (result.findIndex((t) => t[0].id === userToken.id) === -1) {
          const foundIndex = knownTokensInNetwork.findIndex((token) => token.id == userToken.id)
          if (foundIndex !== -1) {
            result.push([knownTokensInNetwork[foundIndex], foundIndex])
          } else {
            const token = await fetchTokenInfoFromFullNode(network, userToken.id)
            if (token) {
              addToken(token)
              result.push([token, foundOnFullNodeIndex])
              foundOnFullNodeIndex++
            } else if (account?.networkId === 'devnet') {
              result.push([devnetToken(userToken), knownTokensInNetwork.length])
            }
          }
        }
      }

      return result.sort((a, b) => a[1] - b[1]).map(tuple => tuple[0])
    }
  )

  return userShownTokens || []
}

async function fetchTokenInfoFromFullNode(network: Network, tokenId: string): Promise<Token | undefined> {
  const nodeProvider = new NodeProvider(network.nodeUrl)
  try {
    const metadata = await nodeProvider.fetchStdTokenMetaData(tokenId)
    const token: Token = {
      id: tokenId,
      networkId: network.id,
      name: Buffer.from(metadata.name, 'hex').toString('utf8'),
      symbol: Buffer.from(metadata.symbol, 'hex').toString('utf8'),
      decimals: metadata.decimals
    }

    return token
  } catch (e) {
    console.debug(`Failed to fetch token metadata for ${tokenId}`, e)
    return undefined
  }
}