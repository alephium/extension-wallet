import { L1, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { LedgerState } from "../ledger/types"

const { AlertIcon } = icons

export const LedgerStatus = ({ ledgerState }: { ledgerState: LedgerState | undefined }): JSX.Element => {
  const { t } = useTranslation()
  return (
    ledgerState === "notfound" ?
      <Flex
        direction="column"
        backgroundColor="#330105"
        boxShadow="menu"
        py="3.5"
        px="3.5"
        borderRadius="xl"
      >
        <Flex gap="1" align="center">
          <Text color="errorText">
            <AlertIcon />
          </Text>
          <L1 color="errorText">{t("The Ledger app is not connected")}</L1>
        </Flex>
      </Flex>
      : <></>
  )
}
