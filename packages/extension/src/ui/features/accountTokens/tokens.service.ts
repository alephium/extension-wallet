import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { utils } from "ethers"
import useSWR from "swr"

import { getTokenBalanceForAccount } from "../../../shared/token/getTokenBalance"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { Account } from "../accounts/Account"
import { TokenDetailsWithBalance, getNetworkFeeToken } from "./tokens.state"

export interface TokenView {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string

  image?: string
  showAlways?: boolean
}

const formatTokenBalanceToCharLength =
  (length: number) =>
    (balance: BigNumberish = 0, decimals = 18): string => {
      const balanceBn = BigNumber.from(balance)
      const balanceFullString = utils.formatUnits(balanceBn, decimals)

      // show max ${length} characters or what's needed to show everything before the decimal point
      const balanceString = balanceFullString.slice(
        0,
        Math.max(length, balanceFullString.indexOf(".")),
      )

      // make sure seperator is not the last character, if so remove it
      // remove unnecessary 0s from the end, except for ".0"
      let cleanedBalanceString = balanceString
        .replace(/\.$/, "")
        .replace(/0+$/, "")
      if (cleanedBalanceString.endsWith(".")) {
        cleanedBalanceString += "0"
      }

      return cleanedBalanceString
    }

export const formatTokenBalance = formatTokenBalanceToCharLength(9)

export const toTokenView = ({
  name,
  symbol,
  decimals,
  balance,
  ...rest
}: TokenDetailsWithBalance): TokenView => {
  const decimalsNumber = decimals ?? 18
  return {
    name,
    symbol,
    decimals: decimalsNumber,
    balance: formatTokenBalance(balance, decimalsNumber),
    ...rest,
  }
}

// export const fetchTokenDetails = async (
//   address: string,
//   account: Account,
// ): Promise<Token> => {
//   const tokenContract = new Contract(
//     parsedErc20Abi as Abi,
//     address,
//     account.provider,
//   )
//   const [decimals, name, symbol] = await Promise.all([
//     tokenContract
//       .call("decimals")
//       .then((x) => number.toHex(x.decimals))
//       .catch(() => ""),
//     tokenContract
//       .call("name")
//       .then((x) => shortString.decodeShortString(number.toHex(x.name)))
//       .catch(() => ""),
//     tokenContract
//       .call("symbol")
//       .then((x) => shortString.decodeShortString(number.toHex(x.symbol)))
//       .catch(() => ""),
//   ])
//   const decimalsBigNumber = BigNumber.from(decimals)
//   return {
//     address,
//     name,
//     symbol,
//     networkId: account.networkId,
//     decimals: decimalsBigNumber.toNumber(),
//   }
// }

// export const fetchTokenBalance = async (
//   address: string,
//   account: Account,
// ): Promise<BigNumber> => {
//   const tokenContract = new Contract(
//     parsedErc20Abi as Abi,
//     address,
//     account.provider,
//   )
//   const result = await tokenContract.balanceOf(account.address)
//   return BigNumber.from(uint256.uint256ToBN(result.balance).toString())
// }

export type BalancesMap = Record<string, BigNumber | undefined>

export const fetchAllTokensBalance = async (
  tokenAddresses: string[],
  account: Account,
) => {
  const response = await Promise.allSettled(
    tokenAddresses.map((tokenAddress) => {
      return getTokenBalanceForAccount(tokenAddress, account)
    }),
  )
  return tokenAddresses.reduce<BalancesMap>((acc, addr, i) => {
    const balance = response[i]
    return {
      ...acc,
      [addr]:
        balance.status === "fulfilled"
          ? BigNumber.from(balance.value)
          : undefined, // Error will be surfaced to user by useTokenBalanceForAccount()
    }
  }, {})
}

export const fetchFeeTokenBalance = async (
  account: Account,
): Promise<BigNumber> => {
  const token = await getNetworkFeeToken(account.networkId)
  if (!token) {
    return BigNumber.from(0)
  }
  const balance = await getTokenBalanceForAccount(token.address, account)
  return BigNumber.from(balance)
}

export const useFeeTokenBalance = (account?: Account) => {
  const accountIdentifier = account && getAccountIdentifier(account)

  const {
    data: feeTokenBalance,
    error: feeTokenBalanceError,
    isValidating: feeTokenBalanceValidating,
  } = useSWR(
    [accountIdentifier, "feeTokenBalance"],
    () => account && fetchFeeTokenBalance(account),
    {
      refreshInterval: 30 * 1000, // 30 seconds
      shouldRetryOnError: false,
    },
  )

  return { feeTokenBalance, feeTokenBalanceError, feeTokenBalanceValidating }
}
