import { ALPH_TOKEN_ID, NodeProvider } from "@alephium/web3"
import { BigNumber } from "ethers"
import { memoize } from "lodash-es"
import { useEffect, useMemo, useRef } from "react"
import useSWR, { KeyedMutator } from "swr"
import { getNetwork, Network } from "../../../shared/network"

import { useArrayStorage, useObjectStorage } from "../../../shared/storage/hooks"
import { addToken, removeToken, tokenListStore, tokenStore } from "../../../shared/token/storage"
import { BaseToken, BaseTokenWithBalance, Token, TokenListTokens, TokenWithBalance } from "../../../shared/token/type"
import { alphTokens, equalToken } from "../../../shared/token/utils"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { useAccount } from "../accounts/accounts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { sortBy } from "lodash"
import { addTokenToBalances } from "../../../shared/token/balance"
import { Transaction, compareTransactions } from "../../../shared/transactions"
import { fetchImmutable } from "../../../shared/utils/fetchImmutable"
import { retryWhenRateLimited } from "../../services/swr"

type UseTokensWithBalance = UseTokensBase<TokenWithBalance>
type UseBaseTokensWithBalance = UseTokensBase<BaseTokenWithBalance>

interface UseTokensBase<T> {
  tokenDetails: T[]
  tokenDetailsIsInitialising: boolean
  isValidating: boolean
  mutate: KeyedMutator<T[] | undefined> | KeyedMutator<T[]>
  error?: any
}

export const networkIdSelector = memoize(
  (networkId: string) => (token: Token) => token.networkId === networkId,
)

export const getNetworkFeeToken = async (networkId: string) => {
  const feeToken = alphTokens.find((token) => token.networkId === networkId)
  return feeToken ?? null
}

export const useNetworkFeeToken = (networkId?: string) => {
  const feeToken = alphTokens.find((token) => token.networkId === networkId)
  return feeToken ?? null
}

const tokenSelector = memoize(
  (baseToken: BaseToken) => (token: Token) => equalToken(token, baseToken),
  (baseToken) => getAccountIdentifier({ networkId: baseToken.networkId, address: baseToken.id }),
)

export const useTokensInNetwork = (networkId: string): Token[] => {
  const tokenListTokens: TokenListTokens = useObjectStorage(tokenListStore)
  const tokens: Token[] = useArrayStorage(tokenStore, networkIdSelector(networkId))

  return useMemo(() => {
    const result: Token[] = []

    // Push all tokens from token list that are in the network
    for (const t of tokenListTokens.tokens) {
      if (t.networkId == networkId) {
        result.push({ verified: true, ...t })
      }
    }

    for (const token of tokens) {
      if (tokenListTokens.tokens.findIndex((t) => equalToken(t, token)) === -1) {
        result.push(token)
      } else {
        // Remove token if it is already in the token list
        removeToken(token)
      }
    }
    return result
  }, [tokenListTokens, tokens, networkId])
}

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
  const tokenListTokens = useObjectStorage(tokenListStore)
  const [token] = useArrayStorage(tokenStore, tokenSelector(baseToken))

  const tokenFromTokenList = tokenListTokens.tokens.find((t) => equalToken(t, baseToken))
  if (tokenFromTokenList) {
    return { ...tokenFromTokenList, verified: true, showAlways: true }
  }

  if (token === undefined && baseToken.networkId === 'devnet') {
    return devnetToken(baseToken)
  }
  return token
}

/** error codes to suppress - will not bubble error up to parent */
const SUPPRESS_ERROR_STATUS = [429]

export const useNonFungibleTokensWithBalance = (
  account?: BaseWalletAccount,
): BaseTokenWithBalance[] => {
  const selectedAccount = useAccount(account)
  const networkId = useMemo(() => {
    return selectedAccount?.networkId ?? ""
  }, [selectedAccount?.networkId])
  const cachedFungibleTokens = useTokensInNetwork(networkId)
  const { tokenDetails: allUserTokens } = useAllTokensWithBalance(account)

  const potentialNonFungibleTokens: BaseTokenWithBalance[] = []
  for (const token of allUserTokens) {
    const foundIndex = cachedFungibleTokens.findIndex((t) => t.id == token.id)
    if (foundIndex === -1) {
      potentialNonFungibleTokens.push(token)
    }
  }

  const { data: nonFungibleTokens } = useSWR(
    selectedAccount &&
    potentialNonFungibleTokens.length > 0 &&
    [getAccountIdentifier(selectedAccount), "accountNonFungibleTokens"],
    async () => {
      const network = await getNetwork(networkId)
      const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)

      const nonFungibleTokens: BaseTokenWithBalance[] = []
      for (const token of potentialNonFungibleTokens) {
        if (nonFungibleTokens.findIndex((t) => t.id == token.id) === -1) {
          const tokenType = await fetchImmutable(`token-type-${token.id}`, () => nodeProvider.guessStdTokenType(token.id))
          if (tokenType === 'non-fungible') {
            nonFungibleTokens.push({ id: token.id, networkId: networkId, balance: token.balance })
          }
        }
      }

      return nonFungibleTokens
    },
    {
      refreshInterval: 30000,
      shouldRetryOnError: retryWhenRateLimited
    }
  )

  return nonFungibleTokens || []
}

export const useFungibleTokensWithBalance = (
  account?: BaseWalletAccount
): UseTokensWithBalance => {
  const {
    tokenDetails: allUserTokens,
    tokenDetailsIsInitialising: allUserTokensIsInitialising,
    isValidating: allUserTokensIsValidating,
    error: allUserTokensError
  } = useAllTokensWithBalance(account)
  const networkId = useMemo(() => {
    return account?.networkId ?? ""
  }, [account?.networkId])
  const sortedTokenIds = allUserTokens.map((t) => t.id).sort()
  const cachedTokens = useTokensInNetwork(networkId)
  const {
    data: fungibleTokens,
    isValidating,
    mutate,
    error
  } = useSWR(
    account && [
      getAccountIdentifier(account),
      sortedTokenIds,
      "accountFungibleTokens",
    ],
    async () => {
      const result: [TokenWithBalance, number][] = []
      const network = await getNetwork(networkId)

      let foundOnFullNodeIndex = cachedTokens.length + 1
      for (const userToken of allUserTokens || []) {
        if (result.findIndex((t) => t[0].id === userToken.id) === -1) {
          const foundIndex = cachedTokens.findIndex((token) => token.id == userToken.id)
          if (foundIndex !== -1) {
            const index = cachedTokens[foundIndex].showAlways ? -1 : foundIndex
            result.push([{ balance: userToken.balance, ...cachedTokens[foundIndex] }, index])
          } else {
            const token = await fetchFungibleTokenFromFullNode(network, userToken.id)
            if (token) {
              addToken(token, false)
              result.push([{ balance: userToken.balance, ...token }, foundOnFullNodeIndex])
              foundOnFullNodeIndex++
            }
          }
        }
      }

      return sortBy(result, (a) => a[1]).map(tuple => tuple[0])
    },
    {
      refreshInterval: 30000,
      shouldRetryOnError: retryWhenRateLimited
    }
  )
  const tokenDetailsIsInitialising = !error && !fungibleTokens

  return {
    tokenDetails: fungibleTokens || [],
    tokenDetailsIsInitialising: allUserTokensIsInitialising && tokenDetailsIsInitialising,
    isValidating: allUserTokensIsValidating || isValidating,
    error: allUserTokensError || error,
    mutate
  }
}

export const useAllTokensWithBalance = (
  account?: BaseWalletAccount
): UseBaseTokensWithBalance => {
  const networkId = useMemo(() => {
    return account?.networkId ?? ""
  }, [account?.networkId])

  const { pendingTransactions } = useAccountTransactions(account)
  const pendingTransactionsRef = useRef(pendingTransactions)

  const {
    data: userTokens,
    isValidating,
    error: maybeSuppressError,
    mutate,
  } = useSWR(
    // skip if no account selected
    account && [
      getAccountIdentifier(account),
      "accountTokens",
    ],
    async () => {
      if (!account) {
        return
      }

      const allTokens: BaseTokenWithBalance[] = []
      const network = await getNetwork(networkId)
      const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)
      const tokenBalances = await getBalances(nodeProvider, account.address)

      for (const tokenId of tokenBalances.keys()) {
        if (allTokens.findIndex((t) => t.id == tokenId) === -1) {
          allTokens.push({
            id: tokenId,
            networkId: networkId,
            balance: BigNumber.from(tokenBalances.get(tokenId))
          })
        }
      }

      return allTokens
    },
    {
      refreshInterval: 30000,
      dedupingInterval: 5000,
      shouldRetryOnError: retryWhenRateLimited
    }
  )

  const error = useMemo(() => {
    const errorCode =
      maybeSuppressError?.status || maybeSuppressError?.errorCode
    if (!SUPPRESS_ERROR_STATUS.includes(errorCode)) {
      return maybeSuppressError
    }
  }, [maybeSuppressError])

  const tokenDetailsIsInitialising = !error && !userTokens

  // refetch when there are new pending transactions
  useEffect(() => {
    if (hasNewPendingTx(pendingTransactionsRef.current, pendingTransactions)) {
      mutate()
    }

    pendingTransactionsRef.current = pendingTransactions
  }, [mutate, pendingTransactions])

  return {
    tokenDetails: userTokens || [],
    tokenDetailsIsInitialising,
    isValidating,
    mutate,
    error,
  }
}

function hasNewPendingTx(prevTxs: Transaction[], newTxs: Transaction[]): boolean {
  if (prevTxs.length < newTxs.length) {
    return true
  }

  for (const tx of newTxs) {
    if (prevTxs.findIndex((t) => compareTransactions(t, tx)) === -1) {
      return true
    }
  }

  return false
}

async function getBalances(nodeProvider: NodeProvider, address: string): Promise<Map<string, BigNumber>> {
  const result = await nodeProvider.addresses.getAddressesAddressBalance(address)
  const balances = new Map<string, BigNumber>()
  balances.set(ALPH_TOKEN_ID, BigNumber.from(result.balance))
  if (result.tokenBalances !== undefined) {
    result.tokenBalances.forEach((token) => addTokenToBalances(balances, token.id, BigNumber.from(token.amount)))
  }
  return balances
}

async function fetchFungibleTokenFromFullNode(network: Network, tokenId: string): Promise<Token | undefined> {
  const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)
  try {
    const tokenType = await fetchImmutable(`token-type-${tokenId}`, () => nodeProvider.guessStdTokenType(tokenId))
    if (tokenType !== 'fungible') {
      return undefined
    }

    const metadata = await fetchImmutable(`token-metadata-${tokenId}`, async () => {
      try {
        return (await nodeProvider.fetchFungibleTokenMetaData(tokenId))
      } catch (e: any) {
        if (e.message.startsWith('Failed to call contract')) {
          return { name: undefined, symbol: undefined, decimals: 0 }
        } else {
          throw e
        }
      }
    })

    if (metadata.name && metadata.symbol) {
      return {
        id: tokenId,
        networkId: network.id,
        name: Buffer.from(metadata.name, 'hex').toString('utf8'),
        symbol: Buffer.from(metadata.symbol, 'hex').toString('utf8'),
        decimals: metadata.decimals,
        verified: false
      }
    }
  } catch (e) {
    console.debug(`Failed to fetch token metadata for ${tokenId}`, e)
    return undefined
  }
}
