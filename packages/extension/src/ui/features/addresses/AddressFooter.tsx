import { colord } from 'colord'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const AddressFooterContainer = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90px;
`

export const AddressFooter = styled.div`
  display: flex;
  border-radius: 12px;
  padding: 5px;
  gap: 5px;
  background: ${({ theme }) => colord(theme.bg4).alpha(0.4).toRgbString()};
  box-shadow: 0px 2px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);

  ${({ theme }) => theme.mediaMinWidth.sm`
    left: ${theme.margin.extensionInTab};
    right: ${theme.margin.extensionInTab};
  `}
`

export const FooterTab = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  cursor: pointer;
  width: 50%;
  border-radius: 9px;

  svg {
    font-size: 1.8rem;
  }

  span {
    margin-top: 3px;
  }

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.1);
  }
`
