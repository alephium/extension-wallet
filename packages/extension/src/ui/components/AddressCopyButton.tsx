import { groupOfAddress } from "@alephium/web3"
import { Button, CopyTooltip } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { formatTruncatedAddress, normalizeAddress } from "../services/addresses"
import { useTranslation } from "react-i18next"

export interface AddressCopyButtonProps {
  address: string
  type?: string
  title?: string
}

export const AddressCopyButton: FC<AddressCopyButtonProps> = ({ address, type, title }) => {
  const copyValue = normalizeAddress(address)
  const { t } = useTranslation()
  return (
    <CopyTooltip prompt={type ? t("Click to copy {{ something }}", { something: type }) : t("Click to copy address")} copyValue={copyValue}>
      <Button
        size="3xs"
        color={"white50"}
        bg={"transparent"}
        _hover={{ bg: "neutrals.700", color: "text" }}
      >
        {`${title ?? t("Address_one")}: ${formatTruncatedAddress(address, 6)}`}
      </Button>
    </CopyTooltip>
  )
}

export interface AddressCopyButtonMainProps {
  address: string
}

export const AddressCopyButtonMain: FC<AddressCopyButtonMainProps> = ({ address }) => {
  const copyValue = normalizeAddress(address)
  const { t } = useTranslation()
  return (
    <CopyTooltip prompt={t("Click to copy address")} copyValue={copyValue}>
      <Button
        size="3xs"
        color={"white50"}
        bg={"transparent"}
        _hover={{ bg: "neutrals.700", color: "text" }}
      >
        <Flex gap='1.5'>
          <Box>
            {formatTruncatedAddress(address, 6)}
          </Box>
          <Box>
            /
          </Box>
          <Box>
            {t('Group')}: {groupOfAddress(address)}
          </Box>
        </Flex>
      </Button>
    </CopyTooltip>
  )
}
