import { Empty, EmptyButton, icons } from "@argent/ui"
import { partition } from "lodash-es"
import { FC, useEffect } from "react"
import { useCurrentNetwork } from "../networks/useNetworks"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { isHiddenAccount, useAccounts } from "./accounts.state"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { autoSelectAccountOnNetwork } from "./switchAccount"
import { AccountContainer } from "./AccountContainer"
import { AccountTokens } from "../accountTokens/AccountTokens"

const { WalletIcon, AddIcon } = icons

export interface AccountScreenEmptyProps {
  onAddAccount: () => void
}

export const AccountScreenEmpty: FC<AccountScreenEmptyProps> = ({
  onAddAccount,
}) => {
  const currentNetwork = useCurrentNetwork()
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
  }, [currentNetwork.id, hasVisibleAccounts])

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
