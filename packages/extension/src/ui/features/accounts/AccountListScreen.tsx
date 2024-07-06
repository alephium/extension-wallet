import {
  BarCloseButton,
  BarIconButton,
  NavigationContainer,
  icons,
} from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { partition } from "lodash-es"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useReturnTo } from "../../routes"
import { P } from "../../theme/Typography"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { recover } from "../recovery/recovery.service"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { AccountListScreenItem } from "./AccountListScreenItem"
import {
  isHiddenAccount,
  useAccounts,
  useSelectedAccount,
} from "./accounts.state"
import { HiddenAccountsBar } from "./HiddenAccountsBar"
import { routes } from "../../routes"
import { useTranslation } from "react-i18next"

const { AddIcon } = icons

const Paragraph = styled(P)`
  text-align: center;
`

export const AccountListScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const selectedAccount = useSelectedAccount()
  const allAccounts = useAccounts({ showHidden: true })
  const [hiddenAccounts, visibleAccounts] = partition(
    allAccounts,
    isHiddenAccount,
  )
  const { isBackupRequired } = useBackupRequired()
  const currentNetwork = useCurrentNetwork()
  const hasHiddenAccounts = hiddenAccounts.length > 0

  const onClose = useCallback(async () => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(await recover())
    }
  }, [navigate, returnTo])

  return (
    <>
      <NavigationContainer
        leftButton={<BarCloseButton onClick={onClose} />}
        title={`${currentNetwork.name} accounts`}
        rightButton={
          <BarIconButton
            aria-label="Create new wallet"
            onClick={() => navigate(routes.addAccount())} // Add group selector
          >
            <AddIcon />
          </BarIconButton>
        }
      >
        <Flex p={4} gap={2} direction="column">
          {isBackupRequired && <RecoveryBanner />}
          {visibleAccounts.length === 0 && (
            <Paragraph>
              {hasHiddenAccounts
                ? t("No visible accounts on this network, click below to add one.")
                : t("No accounts on this network, click below to add one.")}
            </Paragraph>
          )}
          {visibleAccounts.map((account) => (
            <AccountListScreenItem
              key={account.address}
              account={account}
              selectedAccount={selectedAccount}
              returnTo={returnTo}
            />
          ))}
        </Flex>
      </NavigationContainer>
      {hasHiddenAccounts && <HiddenAccountsBar />}
    </>
  )
}
