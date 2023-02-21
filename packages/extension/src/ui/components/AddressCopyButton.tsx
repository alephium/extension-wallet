import { Button, CopyTooltip } from "@argent/ui"
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
