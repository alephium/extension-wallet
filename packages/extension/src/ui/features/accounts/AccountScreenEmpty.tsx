import { Empty, EmptyButton, icons } from "@argent/ui"
import { partition } from "lodash-es"
import { FC, useEffect, useState } from "react"
import { useCurrentNetwork } from "../networks/useNetworks"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { isHiddenAccount, useAccounts } from "./accounts.state"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { autoSelectAccountOnNetwork } from "./switchAccount"
import { AccountContainer } from "./AccountContainer"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { discoverAccounts } from "../../services/backgroundAccounts"
import { LoadingScreen } from "../actions/LoadingScreen"

const { WalletIcon, AddIcon } = icons

export interface AccountScreenEmptyProps {
  onAddAccount: () => void
}

export const AccountScreenEmpty: FC<AccountScreenEmptyProps> = ({
  onAddAccount,
}) => {
  const currentNetwork = useCurrentNetwork()
  const allAccounts = useAccounts({ showHidden: true })
  const { isBackupRequired } = useBackupRequired()
  const [discoveringAccounts, setDiscoveringAccounts] = useState(false)
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

    const onDiscoverAccounts = () => {
      setDiscoveringAccounts(true)
      discoverAccounts(currentNetwork.id)
        .then(() => {
          setDiscoveringAccounts(false)
        })
        .catch((e) => {
          console.error(e)
          setDiscoveringAccounts(false)
        })
    }

    // Do not perform automatic accounts discovery for brand new wallets
    const shouldautoDiscoverAccounts = !isBackupRequired && allAccounts.length === 0
    if (shouldautoDiscoverAccounts) {
      onDiscoverAccounts()
    }
  }, [currentNetwork.id, hasVisibleAccounts, allAccounts.length, isBackupRequired])

  if (allAccounts.length === 0 && discoveringAccounts) {
    return <LoadingScreen texts={[
      "Discovering accounts…",
      "Please wait…",
      "Patience is a virtue…",
      "Almost there…",
    ]} />
  }

  if (allAccounts.length > 0) {
    const account = allAccounts[0]
    return (
      <AccountContainer
        scrollKey={"accounts/AccountTokens"}
        account={account}>
        <AccountTokens account={account} />
      </AccountContainer>
    )
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
          leftIcon={<AddIcon />}
          onClick={onAddAccount}
          loadingText={"Creating"}
        >
          New account
        </EmptyButton>
      </Empty>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
