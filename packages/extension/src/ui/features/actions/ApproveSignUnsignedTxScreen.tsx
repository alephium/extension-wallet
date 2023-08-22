import { SignUnsignedTxParams } from "@alephium/web3"
import { H6, H2, P4, CopyTooltip } from "@argent/ui"
import { FC } from "react"

import { ConfirmPageProps } from "./DeprecatedConfirmScreen"
import { Box, Flex, VStack } from "@chakra-ui/react"
import { ConfirmScreen } from "./ConfirmScreen"
import { AccountNetworkInfo } from "./transaction/AccountNetworkInfo"

interface ApproveSignUnsignedTxScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  params: SignUnsignedTxParams & { host: string }
  onSubmit: (data: SignUnsignedTxParams) => void
}

export const ApproveSignUnsignedTxScreen: FC<ApproveSignUnsignedTxScreenProps> = ({
  params,
  onSubmit,
  selectedAccount,
  ...props
}) => {
  return (
    <ConfirmScreen
      confirmButtonText="Sign"
      confirmButtonBackgroundColor="neutrals.800"
      rejectButtonText="Cancel"
      showHeader={false}
      scrollable={false}
      selectedAccount={selectedAccount}
      onSubmit={() => onSubmit(params)}
      {...props}
    >
      {
        params.host &&
        <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        mb="6"
        mt="3"
        gap="6"
        >
          <H2>Sign Unsigned Tx</H2>
          <H6>{params.host}</H6>
        </Flex>
      }
      { selectedAccount &&
        <AccountNetworkInfo account={selectedAccount}/>
      }
      {
        <VStack
          borderRadius="xl"
          backgroundColor="neutrals.800"
          gap="3"
          px="3"
          py="3.5"
        >
          <Flex
            justifyContent="space-between"
            w="full"
          >
            <P4 color="neutrals.300" fontWeight="bold">
              UnsignedTx
            </P4>
            <P4
              color="neutrals.400"
              fontWeight="bold"
              maxWidth="60%"
            >
              <CopyTooltip copyValue={params.unsignedTx} prompt={params.unsignedTx}>
                <Box
                  _hover={{
                    bg: "neutrals.700",
                    color: "text",
                    cursor: "pointer",
                  }}
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  minWidth="0"
                >
                  {params.unsignedTx}
                </Box>
              </CopyTooltip>
            </P4>
          </Flex>
        </VStack>
      }
      <Box w="full" h={20} />
    </ConfirmScreen>
  )
}
