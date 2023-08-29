import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { utils } from "ethers"
import useSWR from "swr"

import { getTokenBalanceForAccount } from "../../../shared/token/balance"
import { TokenWithBalance } from "../../../shared/token/type"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { Account } from "../accounts/Account"
import { getNetworkFeeToken } from "./tokens.state"

export interface TokenView {
  id: string
  name: string
  symbol: string
  decimals: number
  balance: string

  logoURI?: string
  showAlways?: boolean
  verified?: boolean
}

const formatTokenBalanceToCharLength =
  (length: number) =>
    (balance: BigNumberish = 0, decimals = 18): string => {
      const balanceBn = BigNumber.from(balance)
      const balanceFullString = utils.formatUnits(balanceBn, decimals)
      // show max ${length} characters or what's needed to show everything before the decimal point

      let result = balanceFullString
      if (decimals > 0) {
        const balanceString = balanceFullString.slice(
          0,
          Math.max(length, balanceFullString.indexOf(".")),
        )

        // make sure seperator is not the last character, if so remove it
        // remove unnecessary 0s from the end, except for ".0"
        result = balanceString
          .replace(/\.$/, "")
          .replace(/0+$/, "")
        if (result.endsWith(".")) {
          result += "0"
        }
      }

      return result
    }

export const formatTokenBalance = formatTokenBalanceToCharLength(9)

export const toTokenView = ({
  name,
  symbol,
  decimals,
  balance,
  ...rest
}: TokenWithBalance): TokenView => {
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

const fetchFeeTokenBalance = async (
  account: Account,
): Promise<BigNumber> => {
  const token = await getNetworkFeeToken(account.networkId)
  if (!token) {
    return BigNumber.from(0)
  }
  const balance = await getTokenBalanceForAccount(token.id, account)
  return BigNumber.from(balance)
}
