import { FC, Fragment, Suspense, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Address } from '../../../shared/Address'
import { Spinner } from '../../components/Spinner'
import { formatDateTime } from '../../services/dates'
import { openExplorerTransaction } from '../../services/explorer.service'
import { H1, P } from '../../theme/Typography'
import { TransactionItem, TransactionsWrapper } from './TransactionItem'
import { TransferButtons } from './TransferButtons'
import { DailyActivity, getAlephiumActivity } from './useActivity'

interface AddressActivityProps {
  address: Address
}

const Activity: FC<AddressActivityProps> = ({ address }) => {
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
            <SectionHeader>{dateLabel}</SectionHeader>
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

export const AddressActivity: FC<AddressActivityProps> = ({ address }) => (
  <Container>
    <Header>Transfers</Header>
    <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
      <TransferButtons />
      <Activity address={address} />
    </Suspense>
  </Container>
)

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
  margin-bottom: 68px;
`

const Header = styled(H1)`
  margin-bottom: 40px;
`

export const SectionHeader = styled.h3`
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  margin: 10px 16px;
`

const Paragraph = styled(P)`
  text-align: center;
`
