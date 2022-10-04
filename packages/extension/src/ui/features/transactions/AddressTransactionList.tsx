import { Fragment } from 'react'
import styled from 'styled-components'

import { Address } from '../../../shared/addresses'
import { formatDateTime } from '../../services/dates'
import { openExplorerTransaction } from '../../services/explorer.service'
import { orderTransactionsPerDay } from '../../services/transactions'
import { DividerTitle, P } from '../../theme/Typography'
import { TransactionItem, TransactionsWrapper } from './TransactionItem'
import { useAddressTransactions } from './useTransactions'

interface AddressTransactionListProps {
  address: Address
}

const AddressTransactionList = ({ address }: AddressTransactionListProps) => {
  const transactions = useAddressTransactions(address)

  const orderedTransactions = orderTransactionsPerDay(transactions)

  const noActivity = !transactions || transactions.length === 0

  if (noActivity) {
    return <Paragraph>No transactions</Paragraph>
  } else {
    return (
      <>
        {Object.entries(orderedTransactions).map(([dateLabel, transactions]) => (
          <Fragment key={dateLabel}>
            <DividerTitle>{dateLabel}</DividerTitle>
            <TransactionsWrapper>
              {transactions.map((t) => (
                <TransactionItem
                  transaction={t}
                  addressHash={address.hash}
                  key={t.hash}
                  hash={t.hash}
                  status={undefined}
                  meta={{ subTitle: formatDateTime(t.timestamp) }}
                  onClick={() => openExplorerTransaction(t.hash)}
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
