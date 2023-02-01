/* Render Alph fiat price */
// TODO: Put that in JS SDK

import { addApostrophes } from '@alephium/sdk'

const MONEY_SYMBOL = ['', 'K', 'M', 'B', 'T']

export const formatFiatAmountForDisplay = (amount: number): string => {
  if (amount <= 1000000) {
    return addApostrophes(amount.toFixed(2))
  }

  const tier = amount < 1000000000 ? 2 : amount < 1000000000000 ? 3 : 4
  const suffix = MONEY_SYMBOL[tier]
  const scale = Math.pow(10, tier * 3)
  const scaled = amount / scale

  return scaled.toFixed(2) + suffix
}

export const attoAlphToFiat = (attoAlphAmount?: bigint, fiatPrice = 0): number =>
  attoAlphAmount ? fiatPrice * (parseFloat(attoAlphAmount.toString()) / 1e18) : 0
