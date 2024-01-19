import { Empty, EmptyButton, icons } from "@argent/ui"
import { partition } from "lodash-es"
import { FC, useEffect, useState } from "react"
import { discoverAccounts } from "../../services/backgroundAccounts"
import { LoadingScreen } from "../actions/LoadingScreen"

import { useCurrentNetwork } from "../networks/useNetworks"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { isHiddenAccount, useAccounts } from "./accounts.state"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { autoSelectAccountOnNetwork } from "./switchAccount"

const { WalletIcon, AddIcon } = icons

export interface AccountScreenEmptyProps {
  onAddAccount: () => void
  isDeploying?: boolean
}

export const AccountScreenEmpty: FC<AccountScreenEmptyProps> = ({
  onAddAccount,
  isDeploying,
}) => {
  const currentNetwork = useCurrentNetwork()
  const [accountsDiscovered, setAcccountsDiscovered] = useState(false)
  const allAccounts = useAccounts({ showHidden: true })
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const hasVisibleAccounts = visibleAccounts.length > 0
  const hasHiddenAccounts = hiddenAccounts.length > 0
  useEffect(() => {
    /** User made some account visible then returned to this screen */
    if (hasVisibleAccounts) {
      autoSelectAccountOnNetwork(currentNetwork.id)
    }

    if (allAccounts.length === 0) {
      discoverAccounts(currentNetwork.id)
        .then(() => setAcccountsDiscovered(true))
        .catch((e) => {
          console.error(e)
          setAcccountsDiscovered(true)
        })
    }
  }, [currentNetwork.id, hasVisibleAccounts])

  if (allAccounts.length === 0 && !accountsDiscovered) {
    return <LoadingScreen />
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
          leftIcon={<AddIcon />}
          onClick={onAddAccount}
          isLoading={isDeploying}
          isDisabled={isDeploying}
          loadingText={"Creating"}
        >
          Create account
        </EmptyButton>
      </Empty>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
