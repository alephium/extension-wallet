import { L1, L2, P4, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { Collapse } from "@mui/material"
import Tippy from "@tippyjs/react"
import { BigNumber } from "ethers"
import { FC, useEffect, useMemo, useState } from "react"
import { number } from "starknet"

import {
  prettifyCurrencyValue,
  prettifyTokenAmount,
} from "../../../../shared/token/price"
import { CopyTooltip, Tooltip } from "../../../components/CopyTooltip"
import { makeClickable } from "../../../services/a11y"
import { useAccount } from "../../accounts/accounts.state"
import { useTokenAmountToCurrencyValue } from "../../accountTokens/tokenPriceHooks"
import { useFeeTokenBalance } from "../../accountTokens/tokens.service"
import { useNetworkFeeToken } from "../../accountTokens/tokens.state"
import { useExtensionIsInTab } from "../../browser/tabs"
import {
  ExtendableControl,
  FeeEstimationValue,
  LoadingInput,
  StyledInfoRoundedIcon,
  StyledReportGmailerrorredRoundedIcon,
} from "./styled"
import { TransactionsFeeEstimationProps } from "./types"
import { getTooltipText, useMaxFeeEstimation } from "./utils"
import { getParsedError } from "./utils"

const { AlertIcon, ChevronDownIcon } = icons

export const FeeEstimation: FC<TransactionsFeeEstimationProps> = ({
  transaction,
}) => {
  const fee = transaction !== undefined ? BigInt(transaction.result.gasAmount) * BigInt(transaction.result.gasPrice) : undefined
  const enoughBalance = true
  const extensionInTab = useExtensionIsInTab()

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
                {getTooltipText(fee?.toString(), fee !== undefined ? BigNumber.from(fee) : undefined)} { /* TODO: show proper tips */ }
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
            {(
              <L2 color="neutrals.300">
                (Max {prettifyCurrencyValue(fee.toString())})
              </L2>
            )}

            <Flex alignItems="center">
              {fee !== undefined ? (
                <P4 fontWeight="bold">
                  ≈ {prettifyCurrencyValue(fee.toString())}
                </P4>
              ) : (
                <P4 fontWeight="bold">
                  ≈{" "}
                    <>{fee} Unknown</>
                </P4>
              )}
            </Flex>
          </Flex>
        ) : (
          <LoadingInput />
        )}
      </Flex>

      {/* {showError && (
        <Flex
          direction="column"
          backgroundColor="#330105"
          boxShadow="menu"
          py="3.5"
          px="3.5"
          borderRadius="xl"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Flex gap="1" align="center">
              <Text color="errorText">
                <AlertIcon />
              </Text>
              <L1 color="errorText">
                {showFeeError
                  ? "Not enough funds to cover for fees"
                  : "Transaction failure predicted"}
              </L1>
            </Flex>
            {!showFeeError && (
              <ExtendableControl
                {...makeClickable(() => setFeeEstimateExpanded((x) => !x), {
                  label: "Show error details",
                })}
              >
                <Text color="errorText">
                  <ChevronDownIcon
                    style={{
                      transition: "transform 0.2s ease-in-out",
                      transform: feeEstimateExpanded
                        ? "rotate(-180deg)"
                        : "rotate(0deg)",
                    }}
                    height="14px"
                    width="16px"
                  />
                </Text>
              </ExtendableControl>
            )}
          </Flex>

          <Collapse
            in={feeEstimateExpanded}
            timeout="auto"
            style={{
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            {parsedFeeEstimationError && (
              <CopyTooltip
                copyValue={parsedFeeEstimationError}
                message="Copied"
              >
                <P4 color="errorText" pt="3">
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {parsedFeeEstimationError}
                  </pre>
                </P4>
              </CopyTooltip>
            )}
          </Collapse>
        </Flex>
      )} */}
    </Flex>
  )
}
