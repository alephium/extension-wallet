import { prettifyAttoAlphAmount } from "@alephium/web3"
import { P4 } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import Tippy from "@tippyjs/react"
import { FC } from "react"
import { alphTokenInNetwork } from "../../../../shared/token/utils"

import { Tooltip } from "../../../components/CopyTooltip"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenBalanceForAccount } from "../../accountTokens/useTokenBalanceForAccount"
import { useExtensionIsInTab } from "../../browser/tabs"
import {
  LoadingInput,
  StyledInfoRoundedIcon,
  StyledReportGmailerrorredRoundedIcon,
} from "./styled"
import { TransactionsFeeEstimationProps } from "./types"
import { getTooltipText } from "./utils"
import { useTranslation } from "react-i18next"

export const FeeEstimation: FC<TransactionsFeeEstimationProps> = ({
  accountAddress,
  networkId,
  transaction,
}) => {
  const { t } = useTranslation()
  const fee = transaction && BigInt(transaction.result.gasAmount) * BigInt(transaction.result.gasPrice)
  const enoughBalance = true
  const extensionInTab = useExtensionIsInTab()
  const account = useAccount({ address: accountAddress, networkId })
  const { tokenWithBalance } = useTokenBalanceForAccount({ token: alphTokenInNetwork(networkId), account })
  const feeTokenBalance = tokenWithBalance?.balance

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
            {t("Network fee")}
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
