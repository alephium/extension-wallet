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

import { colord } from 'colord'
import { ArrowDown, ArrowLeftRight, ArrowUp, CircleEllipsis } from 'lucide-react'
import { useTheme } from 'styled-components'

import { TransactionInfoType } from '../../../shared/alephium-transactions'

export const useTransactionUI = (infoType: TransactionInfoType) => {
  const theme = useTheme()

  return {
    label: {
      in: 'Received',
      out: 'Sent',
      move: 'Moved',
      pending: 'Pending'
    }[infoType],
    amountTextColor: {
      in: theme.blue0,
      out: theme.red1,
      move: theme.green1,
      pending: theme.text1
    }[infoType],
    amountSign: {
      in: '+ ',
      out: '- ',
      move: '',
      pending: ''
    }[infoType],
    Icon: {
      in: ArrowDown,
      out: ArrowUp,
      move: ArrowLeftRight,
      pending: CircleEllipsis
    }[infoType],
    iconColor: {
      in: theme.blue0,
      out: theme.red1,
      move: theme.text2,
      pending: theme.text2
    }[infoType],
    iconBgColor: {
      in: colord(theme.blue0).alpha(0.11).toRgbString(),
      out: colord(theme.red1).alpha(0.11).toRgbString(),
      move: colord(theme.text2).alpha(0.11).toRgbString(),
      pending: colord(theme.text2).alpha(0.11).toRgbString()
    }[infoType]
  }
}
