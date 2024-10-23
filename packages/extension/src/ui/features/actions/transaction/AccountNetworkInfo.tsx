import { P4 } from "@argent/ui"
import { Flex, VStack } from "@chakra-ui/react"

import { Account } from "../../accounts/Account"
import { PrettyAccountAddress } from "../../accounts/PrettyAccountAddress"
import { useTranslation } from "react-i18next"

interface AccountNetworkInfoProps {
  accountAddress: string
  networkId: string
}

export const AccountNetworkInfo = ({ accountAddress, networkId }: AccountNetworkInfoProps) => {
  const { t } = useTranslation()
  return (
    <VStack
      borderRadius="xl"
      backgroundColor="neutrals.800"
      gap="3"
      px="3"
      py="3.5"
    >
      <Flex w="full" justifyContent="space-between">
        <P4 fontWeight="bold" color="neutrals.300">
          {t("From")}
        </P4>
        <PrettyAccountAddress
          size={6}
          accountAddress={accountAddress}
          networkId={networkId}
          bold
        />
      </Flex>
      <Flex w="full" justifyContent="space-between">
        <P4 fontWeight="bold" color="neutrals.300">
          {t("Network")}
        </P4>
        <P4 fontWeight="bold" color="white">
          {networkId}
        </P4>
      </Flex>
    </VStack>
  )
}
