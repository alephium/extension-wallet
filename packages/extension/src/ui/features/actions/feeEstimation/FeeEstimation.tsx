import { convertSetToAlph } from "@alephium/sdk"
import { prettifyAttoAlphAmount } from "@alephium/web3"
import { L1, L2, P4, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { Collapse } from "@mui/material"
import Tippy from "@tippyjs/react"
import { FC } from "react"

import {
  prettifyCurrencyValue,
} from "../../../../shared/token/price"
import { Tooltip } from "../../../components/CopyTooltip"
import { useAccount } from "../../accounts/accounts.state"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useExtensionIsInTab } from "../../browser/tabs"
import {
  LoadingInput,
  StyledInfoRoundedIcon,
  StyledReportGmailerrorredRoundedIcon,
} from "./styled"
import { TransactionsFeeEstimationProps } from "./types"
import { getTooltipText } from "./utils"

export const FeeEstimation: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  networkId,
  transaction,
}) => {
  const fee = transaction && BigInt(transaction.result.gasAmount) * BigInt(transaction.result.gasPrice)
  const enoughBalance = true
  const extensionInTab = useExtensionIsInTab()
  const account = useAccount({ address: accountAddress, networkId })
  const { feeTokenBalance } = useFeeTokenBalance(account)

  return (
    <Flex direction="column" gap="1">
      <Flex
        borderRadius="xl"
        backgroundColor="neutrals.900"
        border="1px"
        borderColor="neutrals.500"
        boxShadow="menu"
        justifyContent="space-between"
        px="3"
        py="3.5"
      >
        <Flex alignItems="center" justifyContent="center">
          <P4 fontWeight="bold" color="neutrals.300">
            Network fee
          </P4>
          <Tippy
            content={
              <Tooltip as="div">
                {getTooltipText(fee?.toString(), feeTokenBalance)}
              </Tooltip>
            }
          >
            {enoughBalance ? (
              <StyledInfoRoundedIcon />
            ) : (
              <StyledReportGmailerrorredRoundedIcon />
            )}
          </Tippy>
        </Flex>
        {fee ? (
          <Flex
            gap="1"
            alignItems="center"
            direction={extensionInTab ? "row" : "column-reverse"}
          >
            <Flex alignItems="center">
              <P4 fontWeight="bold">
                ≈ {`${prettifyAttoAlphAmount(fee)} ALPH`}
              </P4>
            </Flex>
          </Flex>
        ) : (
          <LoadingInput />
        )}
      </Flex>
    </Flex>
  )
}
