import { FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

const BannerWrapper = styled.div<{
  noMargins?: boolean
  type?: 'danger'
}>`
  display: flex;
  cursor: pointer;
  align-items: center;
  padding: 16px;
  background-color: ${({ theme }) => theme.bg.highlight};
  border-radius: 8px;

  ${({ noMargins = false }) =>
    !noMargins &&
    css`
      margin: 16px 20px;
    `};

  ${({ type, theme }) =>
    type === 'danger' &&
    css`
      background-color: ${({ theme }) => theme.global.alert};

      h1,
      p {
        color: ${theme.font.primary};
      }
    `};
`

const BannerTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`

const BannerTitle = styled.h1`
  color: black;
  margin: 0;
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
`

const BannerDescription = styled.p`
  font-weight: 400;
  font-size: 13px;
  line-height: 20px;
  color: ${({ theme }) => theme.font.secondary};
`

export interface BannerProps {
  title: string
  description: string
  icon: ReactNode
  noMargins?: boolean
  theme?: 'danger'
}

export const Banner: FC<BannerProps> = ({ title, description, icon, noMargins, theme }) => (
  <BannerWrapper noMargins={noMargins} type={theme}>
    {icon}
    <BannerTextWrapper>
      <BannerTitle>{title}</BannerTitle>
      <BannerDescription>{description}</BannerDescription>
    </BannerTextWrapper>
  </BannerWrapper>
)
