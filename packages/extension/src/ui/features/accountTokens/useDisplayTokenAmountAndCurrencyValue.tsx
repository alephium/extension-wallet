import { Number256, prettifyTokenAmount } from "@alephium/web3"
import { BigNumberish } from "ethers"

import {
  PRETTY_UNLIMITED,
  isUnlimitedAmount,
  prettifyCurrencyValue,
  prettifyTokenAmount as argentPrettifyTokenAmount,
} from "../../../shared/token/price"
import { useAppState } from "../../app.state"
import { formatLongString, isEqualAddress } from "../../services/addresses"
import { showTokenId } from "../accountActivity/transform/transaction/transformTransaction"
import { useTokenAmountToCurrencyValue } from "./tokenPriceHooks"
import { useTokensInNetwork } from "./tokens.state"

export interface IUseDisplayTokenAmountAndCurrencyValue {
  amount: BigNumberish
  tokenAddress?: string
  currencySymbol?: string
}

export const useDisplayTokenAmountAndCurrencyValue = ({
  amount,
  tokenAddress,
  currencySymbol = "$",
}: IUseDisplayTokenAmountAndCurrencyValue) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  const token = tokenAddress
    ? tokensByNetwork.find(({ address }) =>
        isEqualAddress(address, tokenAddress),
      )
    : undefined
  const amountCurrencyValue = useTokenAmountToCurrencyValue(token, amount)
  if (!token) {
    return {
      displayAmount: null,
      displayValue: null,
    }
  }
  const displayAmount = argentPrettifyTokenAmount({
    amount,
    decimals: token?.decimals,
    symbol: token?.symbol || "Unknown token",
  })
  let displayValue = null
  if (amountCurrencyValue && isUnlimitedAmount(amount)) {
    displayValue = [currencySymbol, PRETTY_UNLIMITED].filter(Boolean).join("")
  } else {
    displayValue = prettifyCurrencyValue(amountCurrencyValue, currencySymbol)
  }
  return {
    displayAmount,
    displayValue,
  }
}

export interface IUseDisplayTokensAmountAndCurrencyValue {
  amounts: {id: string, amount: Number256}[],
  currencySymbol?: string
}

const defaultAmountFmt: BigIntToLocaleStringOptions = {
  notation: 'scientific',
  maximumFractionDigits: 6 // The default is 3, but 20 is the maximum supported by JS according to MDN.
};

export const useDisplayTokensAmountAndCurrencyValue = ({
  amounts,
  currencySymbol = "$",
}: IUseDisplayTokensAmountAndCurrencyValue) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  return amounts.map(amount => {
    const token = amount.id
      ? tokensByNetwork.find(({ address }) =>
          isEqualAddress(address, amount.id),
        )
      : undefined
      const naiveAmount = amount.amount.toLocaleString('en-US', defaultAmountFmt)
      if (token === undefined) {
        return {
          displayAmount: naiveAmount,
          displayTokenId: showTokenId(amount.id),
          displayValue: null,
        }
      }
      const displayAmount = prettifyTokenAmount(amount.amount, token.decimals)
      const displayValue = null
      if (displayAmount !== undefined) {
        return {
          displayAmount: displayAmount, 
          displayTokenId: token.symbol ?? showTokenId(token.address),
          displayValue,
        }
      } else {
        return {
          displayAmount: naiveAmount,
          displayTokenId: token.symbol ?? showTokenId(token.address),
          displayValue: null
        }
      }
  })
}
