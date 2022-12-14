import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

export const H1 = styled.h1`
  font-weight: bold;
  font-size: 40px;
  text-align: center;
  color: ${({ theme }) => theme.font.primary};
  margin: 12px 0;
`

export const H2 = styled.h2`
  font-weight: bold;
  font-size: 34px;
  line-height: 41px;
  color: ${({ theme }) => theme.font.primary};
  margin: 0 0 16px 0;
`

export const H3 = styled.h3`
  font-weight: bold;
  font-size: 22px;
  line-height: 28px;
  color: ${({ theme }) => theme.font.primary};
`

export const H4 = styled.h4`
  font-weight: bold;
  font-size: 20px;
  line-height: 25px;
  color: ${({ theme }) => theme.font.primary};
`

export const H5 = styled.h5`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: ${({ theme }) => theme.font.primary};
`

export const P = styled.p`
  font-size: 16px;
  line-height: 19px;
  color: ${({ theme }) => theme.font.primary};
`

export const SectionTitle = styled.h2`
  font-weight: 600;
  font-size: 18px;
  line-height: 20px;
  margin: 10px 16px 15px 16px;
  color: ${({ theme }) => theme.font.primary};
`

export const DividerTitle = styled.h3`
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  margin: 10px 16px;
  color: ${({ theme }) => theme.font.secondary};
`

export const FormError = styled.p`
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.global.alert};
  text-align: left;
`

const anchorCss = css`
  display: inline-block;
  text-decoration: none;
  color: ${({ theme }) => theme.global.accent};
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 200ms ease-in-out;

  &:visited {
    color: ${({ theme }) => theme.global.accent};
  }

  &:hover {
    color: ${({ theme }) => theme.blue2};
    outline: 0;
    border: 0;
  }
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    color: ${({ theme }) => theme.blue2};
    outline: 0;
    border: 0;
  }
`

export const A = styled.a`
  ${anchorCss}
`

export const StyledLink = styled(Link)`
  ${anchorCss}
`
