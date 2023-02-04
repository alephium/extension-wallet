import { CellStack } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import useSWR from "swr"

import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { userReviewStore } from "../../../shared/userReview"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { routes } from "../../routes"
import { withPolling } from "../../services/swr"
import { Account } from "../accounts/Account"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { StatusMessageBannerContainer } from "../statusMessage/StatusMessageBanner"
import { AccountTokensButtons } from "./AccountTokensButtons"
import { AccountTokensHeader } from "./AccountTokensHeader"
import { TokenList } from "./TokenList"
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { useFeeTokenBalance } from "./tokens.service"
import { UpgradeBanner } from "./UpgradeBanner"
import { useAccountStatus } from "./useAccountStatus"

interface AccountTokensProps {
  account: Account
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  const navigate = useNavigate()
  const status = useAccountStatus(account)
  const { accountNames } = useAccountMetadata()
  const { isBackupRequired } = useBackupRequired()
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()
  const transactionsBeforeReview = useKeyValueStorage(
    userReviewStore,
    "transactionsBeforeReview",
  )

  const userHasReviewed = useKeyValueStorage(userReviewStore, "hasReviewed")

  const accountName = getAccountName(account, accountNames)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    // Disable review
    /*
    if (!userHasReviewed && transactionsBeforeReview === 0) {
      timeoutId = setTimeout(() => navigate(routes.userReview()), 1000)
    }
    */
    return () => timeoutId && clearTimeout(timeoutId)
  }, [navigate, transactionsBeforeReview, userHasReviewed])

  const showBackupBanner = isBackupRequired

  const tokenListVariant = currencyDisplayEnabled ? "default" : "no-currency"
  return (
    <Flex direction={"column"} data-testid="account-tokens">
      <VStack spacing={6} mt={4} mb={6}>
        <AccountTokensHeader
          status={status}
          account={account}
          accountName={accountName}
        />
        <AccountTokensButtons account={account} />
      </VStack>
      <CellStack pt={0}>
        <StatusMessageBannerContainer />
        {showBackupBanner && <RecoveryBanner />}
        <TokenList variant={tokenListVariant} showNewTokenButton />
      </CellStack>
    </Flex>
  )
}
