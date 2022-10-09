import 'swiper/css'
import 'swiper/css/pagination'

import { createTheme } from '@mui/material/styles'
import React, { FC } from 'react'
import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle, css } from 'styled-components'
import { normalize } from 'styled-normalize'

export const colors = {
  bg4: '#5f5e5c',
  blue2: '#94e2ff',

  bg: {
    highlight: '#fafafa',
    primary: '#19191E',
    secondary: '#141417',
    tertiary: '#101012',
    accent: '#27272C'
  },
  font: {
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.65)',
    tertiary: 'rgba(255, 255, 255, 0.40)',
    contrast: '#19191E'
  },
  border: {
    primary: '#CCCCCC',
    secondary: '#f1f1f1'
  },
  global: {
    accent: '#5981f3',
    alert: '#ed4a34',
    valid: '#4ebf08',
    star: '#FFD66D'
  },
  gradient: {
    yellow: '#FFCD82',
    orange: '#F95B50',
    red: '#EA3D74',
    purple: '#6A5DF8',
    cyan: '#49D2ED'
  }
}

const MEDIA_WIDTHS = {
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
}

/**
 * Adds Media Query with max-width property
 *
 * Example: ${({ theme }) => theme.mediaMaxWidth.sm`
 *  background-color: red
 * `}
 * The above snippet resolves to
 *
 * @media (max-width: 600px) {
 *    background-color: red
 * }
 *
 */
const mediaMaxWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `
  return accumulator
}, {}) as any

/**
 * Adds Media Query with min-width property
 *
 * Example: ${({ theme }) => theme.mediaMinWidth.lg`
 *  margin: 10px
 * `}
 * The above snippet resolves to
 *
 * @media (min-width: 1200px) {
 *    margin: 10px
 * }
 *
 */
const mediaMinWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (min-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `
  return accumulator
}, {}) as any

/**
 * Simpler way to add flex Column with nowrap
 *
 * Example: const Button = styled.button`
 *  ${({ theme }) => theme.flexColumnNoWrap}
 *  background-color: red
 * `
 *
 * The above snippet resolves to
 * const Button = styled.button`
 *   display: flex;
 *   flex-flow: column nowrap;
 *   background-color: red
 * `
 */
const flexColumnNoWrap = css`
  display: flex;
  flex-flow: column nowrap;
`

/**
 * Simpler way to add flex row with nowrap
 *
 * Example: const Button = styled.button`
 *  ${({ theme }) => theme.flexColumnNoWrap};
 *  background-color: red;
 * `
 *
 * The above snippet resolves to
 * const Button = styled.button`
 *    display: flex;
 *    flex-flow: row nowrap;
 *   background-color: red;
 * `
 */

const flexRowNoWrap = css`
  display: flex;
  flex-flow: row nowrap;
`

export const theme: DefaultTheme = {
  ...colors,
  flexColumnNoWrap,
  flexRowNoWrap,
  // media queries
  mediaMaxWidth: mediaMaxWidthTemplates,
  mediaMinWidth: mediaMinWidthTemplates,
  margin: {
    extensionInTab: '10%'
  }
}

export const ThemeProvider: FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return <StyledComponentsThemeProvider theme={theme}>{children}</StyledComponentsThemeProvider>
}

export interface GlobalStyleProps {
  extensionIsInTab: boolean
}

export const FixedGlobalStyle = createGlobalStyle<GlobalStyleProps>`
  ${normalize}

  body {
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  html, body {
    min-width: 360px;
    min-height: 600px;

    width: ${({ extensionIsInTab }) => (extensionIsInTab ? 'unset' : '360px')};
    height: ${({ extensionIsInTab }) => (extensionIsInTab ? 'unset' : '600px')};

    overscroll-behavior: none;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    &::-webkit-scrollbar { /* Chrome, Safari, Opera */
      display: none;
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    margin-block: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`

export const ThemedGlobalStyle = createGlobalStyle`
  body {
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.secondary};
  }
`

export const muiTheme = createTheme({
  palette: {
    mode: 'dark'
  }
})
