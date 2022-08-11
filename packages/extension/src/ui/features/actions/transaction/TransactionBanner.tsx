import { FC } from "react"
import styled from "styled-components"

const Container = styled.div`
  background-color: ${({ theme }) =>
    theme.red4};
  color: ${({ theme }) => theme.text1};
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: row;
`

const IconContainer = styled.div`
  margin-right: 8px;
  svg {
    font-size: inherit;
    height: 18px; /** ensures icon is visually centered with first line of text at 18px line height */
  }
`

export interface ITransactionBanner {
  icon: FC
  message?: string
}

export const TransactionBanner: FC<ITransactionBanner> = ({
  icon: Icon,
  message,
}) => {
  return (
    <Container>
      <IconContainer>
        <Icon />
      </IconContainer>
      {message}
    </Container>
  )
}
