import { H5, P4, icons } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { TransactionParams } from "../../../../shared/actionQueue/types"

import { useTranslation } from "react-i18next"

export interface DappHeaderProps {
  transaction: TransactionParams
}

export const DappHeader = ({
  transaction,
}: DappHeaderProps) => {
  const { t } = useTranslation()
  const title = useMemo(() => {
    switch (transaction.type) {
      case 'TRANSFER':
        return t("Review transfer")
      case 'DEPLOY_CONTRACT':
        return t("Review contract deploy")
      case 'EXECUTE_SCRIPT':
        return t("Review dApp transaction")
      case 'UNSIGNED_TX':
        return t("Review transaction")
    }
  }, [t, transaction.type])

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
