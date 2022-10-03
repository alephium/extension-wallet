import { FC, Fragment, Suspense, useEffect } from 'react'
import styled from 'styled-components'

import { Spinner } from '../../components/Spinner'
import { formatDateTime } from '../../services/dates'
import { openExplorerTransaction } from '../../services/explorer.service'
import { orderTransactionsPerDay } from '../../services/transactions'
import { DividerTitle, H1 } from '../../theme/Typography'
import { useWalletState } from '../wallet/wallet.state'
import { TransactionItem, TransactionsWrapper } from './TransactionItem'
import { TransferButtons } from './TransferButtons'
import { useAllTransactions } from './useTransactions'

interface WalletTransfersScreenProps {
  className?: string
}

const WalletTransfersScreen: FC<WalletTransfersScreenProps> = ({ className }) => {
  const transactions = useAllTransactions()
  const orderedTransactions = orderTransactionsPerDay(transactions)

  useEffect(() => {
    useWalletState.setState({ headerTitle: 'Transfers' })
  }, [])

  return (
    <div className={className}>
      <Header>Transfers</Header>
      <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
        <TransferButtons />
      </Suspense>
      {Object.entries(orderedTransactions).map(([dateLabel, transactions]) => (
        <Fragment key={dateLabel}>
          <DividerTitle>{dateLabel}</DividerTitle>
          <TransactionsWrapper>
            {transactions.map(({ hash, timestamp }) => (
              <TransactionItem
                key={hash}
                hash={hash}
                status={undefined}
                meta={{ subTitle: formatDateTime(timestamp) }}
                onClick={() => openExplorerTransaction(hash)}
              />
            ))}
          </TransactionsWrapper>
        </Fragment>
      ))}
    </div>
  )
}

export default styled(WalletTransfersScreen)`
  display: flex;
  flex-direction: column;
  margin-bottom: 68px;
`

const Header = styled(H1)`
  margin-bottom: 40px;
`
