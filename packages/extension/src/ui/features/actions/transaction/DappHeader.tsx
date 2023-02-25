import { H5, P4, icons } from "@argent/ui"
import { Box, Center, Flex, VStack } from "@chakra-ui/react"
import React, { useMemo } from "react"
import styled from "styled-components"
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
    <Box mb="6" mt="3">
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      gap="3"
    >
      <TransactionIcon transaction={transaction}/>
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="0.5"
      >
        <H5>
          {title}
        </H5>
        {transaction.params.host && (
          <P4 color="neutrals.300" sx={{ marginTop: 0 }}>
            {transaction.params.host}
          </P4>
        )}
      </Flex>
    </Flex>
  </Box>
  )
}

const {
  SendIcon,
  DeployIcon,
  HelpIcon,
  MulticallIcon
} = icons

const TransactionIcon = ({transaction}: {transaction: TransactionParams}) => {
  switch (transaction.type) {
    case 'TRANSFER':
      return <SendIcon fontSize={"4xl"} color="white" /> 
    case 'DEPLOY_CONTRACT':
      return <DeployIcon fontSize={"4xl"} color="white" /> 
    case 'EXECUTE_SCRIPT':
      return <MulticallIcon fontSize={"4xl"} color="white" /> 
    case 'UNSIGNED_TX':
      return <HelpIcon fontSize={"4xl"} color="white" /> 
  }            
}              
