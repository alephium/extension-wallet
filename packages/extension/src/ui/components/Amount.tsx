/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { formatAmountForDisplay } from '@alephium/sdk'
import styled, { useTheme } from 'styled-components'

import { formatFiatAmountForDisplay } from '../../shared/utils/amount'
import AlefSymbol from './AlefSymbol'

export type Currency = 'CHF' | 'GBP' | 'EUR' | 'USD'

interface AmountProps {
  value?: bigint
  fadeDecimals?: boolean
  fullPrecision?: boolean
  prefix?: string
  suffix?: string
  fiat?: number
  fiatCurrency?: Currency
  className?: string
}

const Amount = ({
  value,
  className,
  fadeDecimals,
  fullPrecision = false,
  prefix,
  suffix,
  fiatCurrency,
  fiat
}: AmountProps) => {
  const theme = useTheme()

  let integralPart = '0'
  let fractionalPart = '00'
  let moneySymbol = ''

  let amount = ''

  if (fiat) {
    amount = formatFiatAmountForDisplay(fiat)
  } else if (value !== undefined) {
    amount = formatAmountForDisplay(value, fullPrecision)
  }

  if (amount) {
    if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
      moneySymbol = amount.slice(-1)
      amount = amount.slice(0, -1)
    }
    const amountParts = amount.split('.')
    integralPart = amountParts[0]
    fractionalPart = amountParts[1]
  }

  const displaySuffix = moneySymbol && suffix ? ` ${suffix}` : fiatCurrency ? ` ${fiatCurrency}` : ''

  return (
    <span className={className}>
      <>
        {amount !== undefined ? (
          fadeDecimals ? (
            <>
              {prefix && <span>{prefix}</span>}
              <span>{integralPart}</span>
              <FadedPart>
                .{fractionalPart}
                {displaySuffix && <span>{displaySuffix}</span>}
              </FadedPart>
            </>
          ) : (
            `${integralPart}.${fractionalPart}`
          )
        ) : (
          '-'
        )}
        {value && (
          <FadedPart>
            <AlefSymbol color={theme.font.primary} />
          </FadedPart>
        )}
      </>
    </span>
  )
}

const FadedPart = styled.span`
  opacity: 0.7;
`

export default Amount
