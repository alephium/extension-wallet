import { Fragment } from 'react'
import styled from 'styled-components'

import { WalletAccount } from '../../../shared/wallet.model'
import { formatDateTime } from '../../services/dates'
import { openExplorerTransaction } from '../../services/blockExplorer.service'
import { orderTransactionsPerDay } from '../../services/transactions'
import { DividerTitle, P } from '../../theme/Typography'
import { useAccountTransactionsAlph } from '../accounts/accountTransactions.state'
import { useNetwork } from '../networks/useNetworks'
import { TransactionItem, TransactionsWrapper } from './TransactionItem'

interface AddressTransactionListProps {
  account: WalletAccount
}

const AccountTransactionList = ({ account }: AddressTransactionListProps) => {
  const transactions = useAccountTransactionsAlph(account)
  const {
    explorerUrl
  } = useNetwork(account.networkId)

  if (!explorerUrl) {
    return null
  }

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
                  addressHash={account.address}
                  key={t.hash}
                  hash={t.hash}
                  status={undefined}
                  meta={{ subTitle: formatDateTime(t.timestamp) }}
                  onClick={() => openExplorerTransaction(explorerUrl, t.hash)}
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

export default AccountTransactionList
