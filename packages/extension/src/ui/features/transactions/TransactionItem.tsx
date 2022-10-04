import { Transaction } from '@alephium/sdk/api/explorer'
import { FC } from 'react'
import styled, { css } from 'styled-components'

import { TransactionMeta } from '../../../shared/transactions'
import { AddressHash } from '../../../shared/transactions/transactions'
import { OpenInNewIcon } from '../../components/Icons/MuiIcons'
import { StatusIndicatorColor, TransactionStatusIndicator } from '../../components/StatusIndicator'
import { makeClickable } from '../../services/a11y'
import { formatTruncatedAddress } from '../../services/addresses'
import { useTransactionInfo } from './useTransactionInfo'
import { useTransactionUI } from './useTransactionUI'

const TransactionSubtitle = styled.p`
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
  margin: 0;
`

interface TransactionItemProps {
  transaction: Transaction
  addressHash: AddressHash
  hash: string
  status?: StatusIndicatorColor
  showExternalOpenIcon?: boolean
  highlighted?: boolean
  meta?: TransactionMeta
  onClick?: () => void
}

export const TransactionItem: FC<TransactionItemProps> = ({
  transaction,
  addressHash,
  hash,
  status = 'transparent',
  highlighted,
  meta,
  showExternalOpenIcon = false,
  onClick,
  ...props
}) => {
  const transactionInfo = useTransactionInfo(transaction, addressHash)
  const transactionUI = useTransactionUI(transactionInfo.infoType)

  return (
    <TransactionWrapper {...makeClickable(onClick)} highlighted={highlighted} {...props}>
      <>
        <transactionUI.Icon color={transactionUI.iconColor} />
        <TXDetailsWrapper>
          <TXTextGroup>
            <TXTitle style={{ color: transactionUI.amountTextColor }}>
              {transactionUI.label}
              {showExternalOpenIcon && <OpenInNewIcon style={{ fontSize: '0.8rem', marginLeft: 5 }} />}
            </TXTitle>
            <TransactionSubtitle>{meta?.subTitle || formatTruncatedAddress(hash)}</TransactionSubtitle>
          </TXTextGroup>
          <TransactionStatusIndicator color={status} />
        </TXDetailsWrapper>
      </>
    </TransactionWrapper>
  )
}

export const TXWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  cursor: pointer;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.05);
  }
`

export const TXDetailsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const TXTextGroup = styled.div`
  display: flex;
  flex-direction: column;
`

export const TXTitle = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  margin: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
`
export const TransactionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const TransactionWrapper = styled(TXWrapper)<{ highlighted?: boolean }>`
  cursor: pointer;

  ${({ highlighted }) =>
    highlighted &&
    css`
      background-color: rgba(255, 255, 255, 0.1);
    `}

  &:hover, &:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }
`
