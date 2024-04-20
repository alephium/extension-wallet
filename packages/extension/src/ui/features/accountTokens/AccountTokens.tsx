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
import { useFungibleTokensWithBalance } from "./tokens.state"

interface AccountTokensProps {
  account: Account
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  const { accountNames } = useAccountMetadata()
  const { isBackupRequired } = useBackupRequired()
  const { tokenDetails: tokensForAccount } = useFungibleTokensWithBalance(account)
  const accountName = getAccountName(account, accountNames)

  const showBackupBanner = isBackupRequired

  return (
    <Flex direction={"column"} data-testid="account-tokens">
      <VStack spacing={6} mt={4} mb={6}>
        <AccountTokensHeader
          account={account}
          tokens={tokensForAccount}
          accountName={accountName}
        />
        <AccountTokensButtons tokens={tokensForAccount} />
      </VStack>
      <CellStack pt={0}>
        <StatusMessageBannerContainer />
        {showBackupBanner && <RecoveryBanner />}
        <TokenList variant={'no-currency'} account={account} tokens={tokensForAccount} showNewTokenButton />
      </CellStack>
    </Flex>
  )
}
