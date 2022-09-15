import { Fragment, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Address } from '../../../shared/Address'
import { formatDateTime } from '../../services/dates'
import { openExplorerTransaction } from '../../services/explorer.service'
import { DividerTitle, P } from '../../theme/Typography'
import { TransactionItem, TransactionsWrapper } from './TransactionItem'
import { DailyActivity, getAlephiumActivity } from './useActivity'

interface AddressTransactionListProps {
  address: Address
}

const AddressTransactionList = ({ address }: AddressTransactionListProps) => {
  const [dailyActivity, setDailyActivity] = useState<DailyActivity | undefined>(undefined)

  useEffect(() => {
    getAlephiumActivity(address).then((activity) => {
      setDailyActivity(activity)
    })
  }, [address])

  const noActivity = !dailyActivity || Object.keys(dailyActivity).length === 0
  if (noActivity) {
    return <Paragraph>No transactions</Paragraph>
  } else {
    return (
      <>
        {Object.entries(dailyActivity).map(([dateLabel, transactions]) => (
          <Fragment key={dateLabel}>
            <DividerTitle>{dateLabel}</DividerTitle>
            <TransactionsWrapper>
              {transactions.map(({ hash, date }) => (
                <TransactionItem
                  key={hash}
                  hash={hash}
                  status={undefined}
                  meta={{ subTitle: formatDateTime(date) }}
                  onClick={() => openExplorerTransaction(hash)}
                />
              ))}
            </TransactionsWrapper>
          </Fragment>
        ))}
      </>
    )
  }
}

const Paragraph = styled(P)`
  margin-top: 25px;
  text-align: center;
  color: ${({ theme }) => theme.text2};
`

export default AddressTransactionList
