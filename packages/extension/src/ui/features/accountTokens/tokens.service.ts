import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { utils } from "ethers"
import { TokenWithBalance } from "../../../shared/token/type"

export interface TokenView {
  id: string
  name: string
  symbol: string
  decimals: number
  balance: string

  logoURI?: string
  showAlways?: boolean
  verified?: boolean
  originChain?: string
  unchainedLogoURI?: string
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
