import { H2, Button } from "@argent/ui"
import { VStack, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { TokenWithBalance } from "../../../shared/token/type"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AddressCopyButtonMain } from "../../components/AddressCopyButton"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"

interface AccountSubheaderProps {
  account: BaseWalletAccount
  tokens: TokenWithBalance[]
  accountName?: string
}

export const AccountTokensHeader: FC<AccountSubheaderProps> = ({
  account,
  tokens,
  accountName
}) => {
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokens)
  const accountAddress = account.address

  return (
    <VStack spacing={0.5}>
      {sumCurrencyValue !== undefined ? (
        <H2>{prettifyCurrencyValue(sumCurrencyValue)}</H2>
      ) : (
        <H2>{accountName}</H2>
      )}
      <AddressCopyButtonMain address={accountAddress} />
    </VStack>
  )
}
