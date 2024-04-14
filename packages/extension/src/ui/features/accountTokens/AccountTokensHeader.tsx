import { H2, Button } from "@argent/ui"
import { VStack, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyCurrencyValue } from "../../../shared/token/price"
import { TokenWithBalance } from "../../../shared/token/type"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { AddressCopyButtonMain } from "../../components/AddressCopyButton"
import { RefreshIcon } from "../../components/Icons/MuiIcons"
import { useSumTokenBalancesToCurrencyValue } from "./tokenPriceHooks"

interface AccountSubheaderProps {
  account: BaseWalletAccount
  tokens: TokenWithBalance[]
  refreshTokens: () => void
  accountName?: string
}

export const AccountTokensHeader: FC<AccountSubheaderProps> = ({
  account,
  tokens,
  refreshTokens,
  accountName
}) => {
  const sumCurrencyValue = useSumTokenBalancesToCurrencyValue(tokens)
  const accountAddress = account.address

  return (
    <VStack spacing={0.5}>
      {sumCurrencyValue !== undefined ? (
        <H2>{prettifyCurrencyValue(sumCurrencyValue)}</H2>
      ) : (
        <Flex>
          <H2>{accountName}</H2>
          <Button
            p={0}
            colorScheme={"transparent"}
            leftIcon={<RefreshIcon />}
            color="neutrals.400"
            onClick={refreshTokens}
            _hover={{}}
            _focus={{ background: 'transparent' }}
          >
          </Button>
        </Flex>
      )}
      <AddressCopyButtonMain address={accountAddress} />
    </VStack>
  )
}
