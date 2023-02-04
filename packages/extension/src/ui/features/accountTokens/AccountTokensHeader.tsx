import { groupOfAddress } from "@alephium/web3"
import { Button, FieldError, H2, icons } from "@argent/ui"
import { VStack } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AddressCopyButton } from "../../components/AddressCopyButton"
import { AccountStatus } from "../accounts/accounts.service"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"
import { useTokensWithBalance } from "./tokens.state"

interface AccountSubheaderProps {
  status: AccountStatus
  account: BaseWalletAccount
  accountName?: string
}

export const AccountTokensHeader: FC<AccountSubheaderProps> = ({
  status,
  account,
  accountName
}) => {
  const { tokenDetails } = useTokensWithBalance(account)
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokenDetails)
  const accountAddress = account.address

  return (
    <VStack spacing={0.5}>
      {sumCurrencyValue !== undefined ? (
        <H2>{prettifyCurrencyValue(sumCurrencyValue)}</H2>
      ) : (
        <H2>{accountName}</H2>
      )}
      <AddressCopyButton address={accountAddress} />
      <div>Group: {groupOfAddress(accountAddress)}</div>
      {status.code === "ERROR" && (
        <VStack spacing={2} pt={2}>
          <FieldError>{status.text}</FieldError>
        </VStack>
      )}
    </VStack>
  )
}
