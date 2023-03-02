import { groupOfAddress } from "@alephium/web3"
import { Button, CopyTooltip } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { FC } from "react"

import { formatTruncatedAddress, normalizeAddress } from "../services/addresses"

export interface AddressCopyButtonProps {
  address: string
  type?: string
  title?: string
}

export const AddressCopyButton: FC<AddressCopyButtonProps> = ({ address, type, title }) => {
  const copyValue = normalizeAddress(address)
  return (
    <CopyTooltip prompt={`Click to copy ${type ?? "address"}`} copyValue={copyValue}>
      <Button
        size="3xs"
        color={"white50"}
        bg={"transparent"}
        _hover={{ bg: "neutrals.700", color: "text" }}
      >
        {`${title ?? "Address"}: ${formatTruncatedAddress(address)}`}
      </Button>
    </CopyTooltip>
  )
}

export interface AddressCopyButtonMainProps {
  address: string
}

export const AddressCopyButtonMain: FC<AddressCopyButtonMainProps> = ({ address }) => {
  const copyValue = normalizeAddress(address)
  return (
    <CopyTooltip prompt={`Click to copy address`} copyValue={copyValue}>
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
            {`Group: ${groupOfAddress(address)}`}
          </Box>
        </Flex>
      </Button>
    </CopyTooltip>
  )
}
