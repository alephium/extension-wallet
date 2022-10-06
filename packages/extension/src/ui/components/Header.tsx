import styled, { css } from 'styled-components'

export const Header = styled.header<{
  hide?: boolean
}>`
  height: 100%;
  display: flex;
  padding: 16px;
  align-items: center;
  justify-content: space-between;

  ${({ hide }) =>
    hide &&
    css`
      visibility: hidden;
      user-select: none;
    `}
`
