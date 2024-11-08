import { CellStack } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"
import { FC, useEffect, useMemo, useState } from "react"
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
import { networkIdSelector, useFungibleTokensWithBalance } from "./tokens.state"
import { tokenStore } from "../../../shared/token/storage"

interface AccountTokensProps {
  account: Account
}

export const AccountTokens: FC<AccountTokensProps> = ({ account }) => {
  const { accountNames } = useAccountMetadata()
  const { isBackupRequired } = useBackupRequired()
  const { tokenDetails: tokensForAccount } = useFungibleTokensWithBalance(account)
  const accountName = getAccountName(account, accountNames)
  const [hiddenTokenIds, setHiddenTokenIds] = useState<string[]>([])

  const showBackupBanner = isBackupRequired

  const visibleTokensForAccount = useMemo(
    () => tokensForAccount.filter((token) => !hiddenTokenIds.includes(token.id)),
    [tokensForAccount, hiddenTokenIds]
  )

  useEffect(() => {
    tokenStore.get(networkIdSelector(account.networkId)).then((storedTokens) => {
      const tokenIds: string[] = []
      for (const token of storedTokens) {
        if (token.hide) {
          tokenIds.push(token.id)
        }
      }
      setHiddenTokenIds(tokenIds)
    })
  }, [tokensForAccount, account.networkId])

  return (
    <Flex direction={"column"} data-testid="account-tokens">
      <VStack spacing={6} mt={4} mb={6}>
        <AccountTokensHeader
          account={account}
          tokens={visibleTokensForAccount}
          accountName={accountName}
        />
        <AccountTokensButtons tokens={visibleTokensForAccount} />
      </VStack>
      <CellStack pt={0}>
        <StatusMessageBannerContainer />
        {showBackupBanner && <RecoveryBanner />}
        <TokenList variant={'no-currency'} account={account} tokens={visibleTokensForAccount} showNewTokenButton />
      </CellStack>
    </Flex>
  )
}
