import { CellStack } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"
import { FC } from "react"

import { Account } from "../accounts/Account"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { useBackupRequired } from "../recovery/backupDownload.state"
import { RecoveryBanner } from "../recovery/RecoveryBanner"
import { StatusMessageBannerContainer } from "../statusMessage/StatusMessageBanner"
import { AccountTokensButtons } from "./AccountTokensButtons"
import { AccountTokensHeader } from "./AccountTokensHeader"
import { TokenList } from "./TokenList"
import { useCurrencyDisplayEnabled } from "./tokenPriceHooks"
import { useAccountStatus } from "./useAccountStatus"

interface AccountTokensProps {
  account: Account
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  const status = useAccountStatus(account)
  const { accountNames } = useAccountMetadata()
  const { isBackupRequired } = useBackupRequired()
  const currencyDisplayEnabled = useCurrencyDisplayEnabled()

  const accountName = getAccountName(account, accountNames)

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
