import { colord } from 'colord'
import styled from 'styled-components'
import { DefaultTheme } from 'styled-components'

export type ButtonVariant = 'default' | 'primary' | 'warn' | 'danger'

interface IButton {
  theme: DefaultTheme
  variant?: ButtonVariant
}

/** TODO: move colour tokens into theme */

export const getVariantColor =
  ({ theme, hover = false, disabled = false }: { theme: DefaultTheme; hover?: boolean; disabled?: boolean }) =>
  ({ variant }: IButton) => {
    switch (variant) {
      case 'warn':
        return hover
          ? colord(theme.global.accent).saturate(1).lighten(0.075).toRgbString()
          : disabled
          ? colord(theme.global.accent).alpha(0.5).toRgbString()
          : theme.global.accent
      case 'danger':
        return hover
          ? colord(theme.global.alert).lighten(0.075).toRgbString()
          : disabled
          ? colord(theme.global.alert).alpha(0.5).toRgbString()
          : theme.global.alert
    }
    return hover && !disabled ? `rgba(255, 255, 255, 0.25)` : `rgba(255, 255, 255, 0.15);`
  }

export const Button = styled.button<IButton>`
  margin: 0;
  padding: 13.5px;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  background-color: ${({ theme }) => getVariantColor({ theme, hover: false })};
  border-radius: 100px;
  width: 100%;
  outline: none;
  border: none;
  color: ${({ theme }) => theme.font.primary};
  cursor: pointer;
  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background-color: ${({ theme }) => getVariantColor({ theme, hover: true })};
  }

  &:disabled {
    cursor: auto;
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.5);
    background-color: ${({ theme }) => getVariantColor({ theme, disabled: true })};
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

export const ButtonGroupVertical = styled.div<{
  switchButtonOrder?: boolean
}>`
  display: flex;
  flex-direction: ${({ switchButtonOrder = false }) => (switchButtonOrder ? 'row-reverse' : 'row')};
  gap: 12px;
  width: 100%;
`
