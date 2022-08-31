import { colord } from "colord"
import styled from "styled-components"

export const AddressHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => colord(theme.bg3).alpha(0.4).toRgbString()};
  box-shadow: 0px 2px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  height: 68px;
  z-index: 100;
  ${({ theme }) => theme.mediaMinWidth.sm`
    left: ${theme.margin.extensionInTab};
    right: ${theme.margin.extensionInTab};
  `}
`
