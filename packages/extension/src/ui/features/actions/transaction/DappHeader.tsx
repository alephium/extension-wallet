import { H5, icons } from "@argent/ui"
import { Box, Center, VStack } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { Call } from "starknet"
import { TransactionParams } from "../../../../shared/actionQueue/types"

import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { titleForTransactions } from "./titleForTransactions"

const { NetworkIcon } = icons

export interface DappHeaderProps {
  transaction: TransactionParams
}

export const DappHeader = ({
  transaction,
}: DappHeaderProps) => {
  const title = useMemo(() => {
    return titleForTransactions(transaction)
  }, [transaction])

  return (
    <Box mb="4">
      <VStack gap="1">
        <IconWrapper>
          <NetworkIcon color="#58585B" />
        </IconWrapper>
        <H5>{title}</H5>
      </VStack>
    </Box>
  )
}

const IconWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      w="14"
      h="14"
      background="neutrals.700"
      borderRadius="2xl"
      boxShadow="0px 4px 20px rgba(0, 0, 0, 0.5);"
    >
      <Center justifyContent="center" alignItems="center" height="full">
        {children}
      </Center>
    </Box>
  )
}
