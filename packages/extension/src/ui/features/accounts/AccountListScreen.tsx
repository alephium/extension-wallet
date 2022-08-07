import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { Header } from "../../components/Header"
import { IconButton } from "../../components/IconButton"
import { AddIcon, SettingsIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { connectAccount } from "../../services/backgroundAccounts"
import { H1, P } from "../../theme/Typography"
import { deployAddress } from "../addresses/addresses.service"
import { useAddresses } from "../addresses/addresses.state"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { recover } from "../recovery/recovery.service"
import { Container } from "./AccountContainer"
import { AccountHeader } from "./AccountHeader"
import { AccountListScreenItem } from "./AccountListScreenItem"

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

const AccountListWrapper = styled(Container)`
  display: flex;
  flex-direction: column;

  ${H1} {
    text-align: center;
  }

  > ${AccountList} {
    width: 100%;
  }
`

const IconButtonCenter = styled(IconButton)`
  margin: auto;
`

const Paragraph = styled(P)`
  text-align: center;
`

export const AccountListScreen: FC = () => {
  const navigate = useNavigate()
  const { addresses, selectedAddress, addAddress } = useAddresses()

  const addressesList = Object.values(addresses)

  const handleAddAddress = async () => {
    useAppState.setState({ isLoading: true })
    try {
      const newAddress = await deployAddress()
      addAddress(newAddress)
      connectAccount(newAddress.hash)
      navigate(await recover())
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error())
    } finally {
      useAppState.setState({ isLoading: false })
    }
  }

  return (
    <AccountListWrapper header>
      <AccountHeader>
        <Header>
          <IconButton
            size={36}
            {...makeClickable(() => navigate(routes.settings()), {
              label: "Settings",
              tabIndex: 99,
            })}
          >
            <SettingsIcon />
          </IconButton>
          <NetworkSwitcher />
        </Header>
      </AccountHeader>
      <H1>Accounts</H1>
      <AccountList>
        {addressesList.length === 0 && (
          <Paragraph>
            No accounts on this network, click below to add one.
          </Paragraph>
        )}
        {addressesList.map((address) => (
          <AccountListScreenItem
            key={address.hash}
            address={address}
            selectedAddress={selectedAddress}
          />
        ))}
        <IconButtonCenter
          size={48}
          {...makeClickable(handleAddAddress, { label: "Create new wallet" })}
        >
          <AddIcon fontSize="large" />
        </IconButtonCenter>
      </AccountList>
    </AccountListWrapper>
  )
}
