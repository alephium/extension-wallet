import { FC } from "react"
import styled, { css } from "styled-components"

import { TransactionMeta } from "../../../shared/transactions"
import { OpenInNewIcon } from "../../components/Icons/MuiIcons"
import {
  StatusIndicatorColor,
  TransactionStatusIndicator,
} from "../../components/StatusIndicator"
import { makeClickable } from "../../services/a11y"
import { formatTruncatedAddress } from "../../services/addresses"
import { TokenIcon } from "../addressTokens/TokenIcon"

export const TokenWrapper = styled.div`
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

export const TokenDetailsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const TokenTextGroup = styled.div`
  display: flex;
  flex-direction: column;
`

export const TokenTitle = styled.h3`
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

const TransactionWrapper = styled(TokenWrapper) <{ highlighted?: boolean }>`
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

const TransactionSubtitle = styled.p`
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.text2};
  margin: 0;
`

interface TransactionItemProps {
  hash: string
  status?: StatusIndicatorColor
  showExternalOpenIcon?: boolean
  highlighted?: boolean
  meta?: TransactionMeta
  onClick?: () => void
}

export const TransactionItem: FC<TransactionItemProps> = ({
  hash,
  status = "transparent",
  highlighted,
  meta,
  showExternalOpenIcon = false,
  onClick,
  ...props
}) => (
  <TransactionWrapper
    {...makeClickable(onClick)}
    highlighted={highlighted}
    {...props}
  >
    <TokenIcon name={meta?.title || hash.substring(2)} />
    <TokenDetailsWrapper>
      <TokenTextGroup>
        <TokenTitle>
          {meta?.title || formatTruncatedAddress(hash)}
          {showExternalOpenIcon && (
            <OpenInNewIcon style={{ fontSize: "0.8rem", marginLeft: 5 }} />
          )}
        </TokenTitle>
        <TransactionSubtitle>
          {meta?.subTitle || formatTruncatedAddress(hash)}
        </TransactionSubtitle>
      </TokenTextGroup>
      <TransactionStatusIndicator color={status} />
    </TokenDetailsWrapper>
  </TransactionWrapper>
)
