import { Number256, prettifyTokenAmount } from "@alephium/web3"
import { BigNumberish } from "ethers"

import {
  PRETTY_UNLIMITED,
  isUnlimitedAmount,
  prettifyCurrencyValue,
  prettifyTokenAmount as argentPrettifyTokenAmount,
} from "../../../shared/token/price"
import { useAppState } from "../../app.state"
import { isEqualTokenId } from "../../services/token"
import { showTokenId } from "../accountActivity/transform/transaction/transformTransaction"
import { useTokenAmountToCurrencyValue } from "./tokenPriceHooks"
import { useTokensInNetwork } from "./tokens.state"

export interface IUseDisplayTokenAmountAndCurrencyValue {
  amount: BigNumberish
  tokenId?: string
  currencySymbol?: string
}

export const useDisplayTokenAmountAndCurrencyValue = ({
  amount,
  tokenId,
  currencySymbol = "$",
}: IUseDisplayTokenAmountAndCurrencyValue) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  const token = tokenId
    ? tokensByNetwork.find(({ id }) =>
      isEqualTokenId(id, tokenId),
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
  networkId: string,
  amounts: { id: string, amount: Number256 }[],
  currencySymbol?: string
}

export const useDisplayTokensAmountAndCurrencyValue = ({
  networkId,
  amounts,
  currencySymbol = "$",
}: IUseDisplayTokensAmountAndCurrencyValue) => {
  const { switcherNetworkId } = useAppState()
  const tokensByNetwork = useTokensInNetwork(switcherNetworkId)
  return amounts.map(amount => {
    const token = amount.id
      ? tokensByNetwork.find(({ id }) =>
        isEqualTokenId(id, amount.id),
      )
      : undefined
    const naiveAmount = prettifyTokenAmount(amount.amount, 0) ?? '?'
    if (token === undefined || naiveAmount === undefined) {
      return {
        displayAmount: naiveAmount,
        displayTokenId: showTokenId(networkId, amount.id),
        displayValue: null,
      }
    }

    const displayAmount = prettifyTokenAmount(amount.amount, token.decimals)
    const displayValue = null
    if (displayAmount !== undefined) {
      return {
        displayAmount: displayAmount,
        displayTokenId: token.symbol ?? showTokenId(networkId, token.id),
        displayValue,
      }
    } else {
      return {
        displayAmount: naiveAmount,
        displayTokenId: token.symbol ?? showTokenId(networkId, token.id),
        displayValue: null
      }
    }
  })
}
