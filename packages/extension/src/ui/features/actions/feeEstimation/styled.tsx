import styled, { DefaultTheme, css, keyframes } from "styled-components"

import {
  InfoRoundedIcon,
  ReportGmailerrorredRoundedIcon,
} from "../../../components/Icons/MuiIcons"

export const pulseKeyframe = ({ theme }: { theme: DefaultTheme }) => keyframes`
  0% {
    background-color: ${theme.bg4};
    background: linear-gradient(to right, ${theme.bg4} 0% ${theme.text2} 50%, ${theme.bg4} 100%);
  }
  100% {
    background-color: ${theme.bg4};
    background: linear-gradient(to right,${theme.text2} 0% ${theme.bg4} 50%, ${theme.text2} 100%);
  }
`

export const Separator = styled.div`
  border-top: 1px solid #161616;
  width: 100%;
`

export const LoadingInput = styled.div`
  width: 77px;
  height: 20px;
  border-radius: 2px;
  background: ${({ theme }) => theme.text2};
  animation: ${pulseKeyframe} 1s alternate infinite;
`

export const StyledIconMixin = css`
  max-height: 16px;
  max-width: 16px;
  margin-left: 6px;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
`
export const StyledInfoRoundedIcon = styled(InfoRoundedIcon)`
  ${StyledIconMixin}
`
export const StyledReportGmailerrorredRoundedIcon = styled(
  ReportGmailerrorredRoundedIcon,
)`
  ${StyledIconMixin}
`
