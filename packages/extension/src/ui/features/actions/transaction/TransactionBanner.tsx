import { FC, ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  background-color: ${({ theme }) => theme.global.accent};
  color: ${({ theme }) => theme.font.primary};
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
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
  children?: ReactNode | ReactNode[]
}

export const TransactionBanner: FC<ITransactionBanner> = ({ icon: Icon, children }) => {
  return (
    <Container>
      <IconContainer>
        <Icon />
      </IconContainer>
      {children}
    </Container>
  )
}
