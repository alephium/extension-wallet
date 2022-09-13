import { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { Button } from '../../components/buttons/Button'
import { IconBar } from '../../components/IconBar'
import { ArrowForwardIosIcon } from '../../components/Icons/MuiIcons'
import { routes } from '../../routes'
import { stopSession } from '../../services/backgroundSessions'
import { H2 } from '../../theme/Typography'
import { useExtensionIsInTab, useOpenExtensionInTab } from '../browser/tabs'

export const SettingsScreen: FC = () => {
  const openExtensionInTab = useOpenExtensionInTab()
  const extensionIsInTab = useExtensionIsInTab()
  const { pathname: returnTo } = useLocation()
  return (
    <>
      <IconBar back />
      <SettingsScreenWrapper>
        <H2>Settings</H2>
        <SettingsLinkItem to={routes.lockScreen()} onClick={stopSession}>
          <Title>
            <span>Lock wallet</span>
            <ArrowForwardIosIcon fontSize="inherit" />
          </Title>
        </SettingsLinkItem>
        <hr />
        {!extensionIsInTab && (
          <>
            <SettingsLinkItem to={routes.settings()} onClick={openExtensionInTab}>
              <Title>
                <span>Extended view</span>
                <ArrowForwardIosIcon fontSize="inherit" />
              </Title>
            </SettingsLinkItem>
            <hr />
          </>
        )}
        <SettingsLinkItem to={routes.settingsDappConnections()}>
          <Title>
            <span>Reset dapp connections</span>
            <ArrowForwardIosIcon fontSize="inherit" />
          </Title>
          <P>Dapps you have previously connected to can auto-connect in the future.</P>
        </SettingsLinkItem>
        <hr />
        <SettingsLinkItem to={routes.settingsSeed(returnTo)}>
          <Title>
            <span>Show recovery phrase</span>
            <ArrowForwardIosIcon fontSize="inherit" />
          </Title>
          <P>Your recovery phrase allows anyone to use your account. Keep it secure.</P>
        </SettingsLinkItem>
        <hr />
        <SettingsLinkItem to={routes.settingsNetworks()}>
          <Title>
            <span>Manage networks</span>
            <ArrowForwardIosIcon fontSize="inherit" />
          </Title>
          <P>Here you can add, edit and remove custom networks.</P>
        </SettingsLinkItem>
        <hr />
      </SettingsScreenWrapper>
    </>
  )
}

export const Title = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: ${({ theme }) => theme.text1};

  display: flex;
  align-items: center;
  justify-content: space-between;

  svg {
    color: ${({ theme }) => theme.text2};
    font-size: 12px;
  }
`

export const P = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.text2};
  margin-top: 16px;
`

export const SettingsScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0 24px 0;

  ${H2} {
    margin: 0 32px 32px 32px;
  }

  ${Button} {
    margin-top: 10px;
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.bg2};
  }
`

export const SettingsItem = styled.div`
  padding: 24px 32px;
`

export const SettingsLinkItem = styled(Link)`
  cursor: pointer;
  padding: 24px 32px;

  &:hover svg {
    color: ${({ theme }) => theme.text1};
  }
`

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    padding-bottom: 16px;
  }
`
