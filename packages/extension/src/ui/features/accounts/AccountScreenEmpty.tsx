import { Empty, EmptyButton, icons } from "@argent/ui"
import { partition } from "lodash-es"
import { FC, useEffect, useState } from "react"
import { discoverAccounts } from "../../services/backgroundAccounts"
import { LoadingScreen } from "../actions/LoadingScreen"
import { routes } from "../../routes"
import { Navigate } from "react-router-dom"
import { useCurrentNetwork } from "../networks/useNetworks"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { isHiddenAccount, useAccounts } from "./accounts.state"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { autoSelectAccountOnNetwork } from "./switchAccount"

const { WalletIcon, AddIcon, SearchIcon } = icons

export interface AccountScreenEmptyProps {
  onAddAccount: () => void
}

export const AccountScreenEmpty: FC<AccountScreenEmptyProps> = ({
  onAddAccount,
}) => {
  const currentNetwork = useCurrentNetwork()
  const [discoveringAccount, setDiscoveringAccount] = useState(false)
  const [accountDiscoveryFinished, setAccountDiscoveryFinished] = useState(false)
  const allAccounts = useAccounts({ showHidden: true })
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const hasVisibleAccounts = visibleAccounts.length > 0
  const hasHiddenAccounts = hiddenAccounts.length > 0

  const onDiscoverAccounts = () => {
    setDiscoveringAccount(true)
    discoverAccounts(currentNetwork.id)
      .then(() => {
        setDiscoveringAccount(false)
        setAccountDiscoveryFinished(true)
      })
      .catch((e) => {
        console.error(e)
        setDiscoveringAccount(false)
      })
  }

  useEffect(() => {
    /** User made some account visible then returned to this screen */
    if (hasVisibleAccounts) {
      autoSelectAccountOnNetwork(currentNetwork.id)
    }
  }, [currentNetwork.id, hasVisibleAccounts, accountDiscoveryFinished])

  if (allAccounts.length === 0 && discoveringAccount) {
    return <LoadingScreen />
  } else if (allAccounts.length > 0) {
    return <Navigate to={routes.accountTokens()} />
  }

  return (
    <>
      <AccountNavigationBar showAccountButton={false} account={undefined} />
      <Empty
        icon={<WalletIcon />}
        title={`You have no ${hasHiddenAccounts ? "visible " : ""}accounts on ${currentNetwork.name
          }`}
      >
        <EmptyButton
          size={"sm"}
          colorScheme={"transparent"}
          color={"neutrals.500"}
          leftIcon={<AddIcon />}
          onClick={onAddAccount}
          loadingText={"Creating"}
        >
          New account
        </EmptyButton>
        {
          accountDiscoveryFinished ? (
            <>
              No active accounts found
            </>
          ) :
            (<>
              or
              <EmptyButton
                size={"sm"}
                colorScheme={"transparent"}
                color={"neutrals.500"}
                leftIcon={<SearchIcon />}
                onClick={onDiscoverAccounts}
                loadingText={"Discovering"}
              >
                Discover accounts
              </EmptyButton>
            </>
            )
        }
      </Empty>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
