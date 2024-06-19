import { Empty, EmptyButton, icons } from "@argent/ui"
import { partition } from "lodash-es"
import { FC, useCallback, useEffect, useState } from "react"
import { useCurrentNetwork } from "../networks/useNetworks"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { isHiddenAccount, useAccounts, mapWalletAccountsToAccounts } from "./accounts.state"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { autoSelectAccountOnNetwork } from "./switchAccount"
import { AccountContainer } from "./AccountContainer"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { discoverAccounts } from "../../services/backgroundAccounts"
import { LoadingScreen } from "../actions/LoadingScreen"
import { getAccounts, accountsOnNetwork } from "../../services/backgroundAccounts"
import { getDefaultAccountNameByIndex, useAccountMetadata } from "./accountMetadata.state"
import { useTranslation } from "react-i18next"

const { WalletIcon, AddIcon } = icons

export interface AccountScreenEmptyProps {
  onAddAccount: () => void
}

export const AccountScreenEmpty: FC<AccountScreenEmptyProps> = ({
  onAddAccount,
}) => {
  const { t } = useTranslation()
  const currentNetwork = useCurrentNetwork()
  const initialAllAccounts = useAccounts({ showHidden: true })
  const [allAccounts, setAllAccounts] = useState(initialAllAccounts)
  const { isBackupRequired } = useBackupRequired()
  const [discoveringAccounts, setDiscoveringAccounts] = useState(false)
  const { setAccountName } = useAccountMetadata()
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const hasVisibleAccounts = visibleAccounts.length > 0
  const hasHiddenAccounts = hiddenAccounts.length > 0

  const onDiscoverAccounts = useCallback(async () => {
    setDiscoveringAccounts(true)
    try {
      const allWalletAccounts = await getAccounts(true)
      const allAccountsOnNetwork = mapWalletAccountsToAccounts(accountsOnNetwork(allWalletAccounts, currentNetwork.id))
      const result = await discoverAccounts(currentNetwork.id)
      if (result === "error") {
        console.log("Error discovering accounts")
        setDiscoveringAccounts(false)
      } else {
        const discoveredAccounts = mapWalletAccountsToAccounts(result.accounts)
        setAllAccounts(allAccountsOnNetwork.concat(discoveredAccounts))

        let accountIndex = allAccountsOnNetwork.length
        discoveredAccounts.forEach((account) => {
          setAccountName(account.networkId, account.address, getDefaultAccountNameByIndex(account, accountIndex))
          accountIndex++
        })
        setDiscoveringAccounts(false)
      }
    } catch (e) {
      console.log("Error discovering accounts", e)
      setDiscoveringAccounts(false)
    }
  }, [currentNetwork.id, setAccountName])

  useEffect(() => {
    /** User made some account visible then returned to this screen */
    if (hasVisibleAccounts) {
      autoSelectAccountOnNetwork(currentNetwork.id)
    }

    // Do not perform automatic accounts discovery for brand new wallets
    const shouldautoDiscoverAccounts = !isBackupRequired && allAccounts.length === 0
    if (shouldautoDiscoverAccounts) {
      onDiscoverAccounts()
    }
  }, [currentNetwork.id, hasVisibleAccounts, allAccounts.length, isBackupRequired, onDiscoverAccounts])

  if (allAccounts.length === 0 && discoveringAccounts) {
    return <LoadingScreen texts={[
      t("Discovering accounts…"),
      t("Please wait…"),
      t("Patience is a virtue…"),
      t("Almost there…"),
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
        title={
          hasHiddenAccounts
            ? t("You have no visible accounts on {{ network }}", { network: currentNetwork.name })
            : t("You have no accounts on {{ network }}", { network: currentNetwork.name })
          }
      >
        <EmptyButton
          size={"sm"}
          leftIcon={<AddIcon />}
          onClick={onAddAccount}
          loadingText={"Creating"}
        >
          {t("New account")}
        </EmptyButton>
      </Empty>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
