import { Destination } from "@alephium/web3"
import { CopyTooltip, P4 } from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
} from "@chakra-ui/react"
import { FC } from "react"
import { Call, number } from "starknet"
import { ReviewTransactionResult } from "../../../../shared/actionQueue/types"

import { entryPointToHumanReadable } from "../../../../shared/transactions"
import { formatTruncatedAddress } from "../../../services/addresses"


export interface TransactionActionRow {
    key: string
    value: string
}
export interface TransactionAction {
  header: TransactionActionRow
  details: TransactionActionRow[]
}


function getTokensFromDestination(destination: Destination): TransactionActionRow[] {
  return [{key: 'ALPH', value: destination.attoAlphAmount.toString()},
    ...(destination.tokens ?? []).map(token => ({key: token.id, value: token.amount.toString()}))]
}

export function extractActions(transaction: ReviewTransactionResult): TransactionAction[] {
  switch (transaction.type) {
    case 'TRANSFER':
      return transaction.params.destinations.map((destination) => {
        return {
          header: { key: 'Transfer', value: destination.address },
          details: getTokensFromDestination(destination)
        }
      })
    case 'DEPLOY_CONTRACT':
      return [{
        header: { key: 'Deploy contract', value: transaction.result.contractAddress },
        details: []
      }]
    case 'EXECUTE_SCRIPT':
      return [{
        header: { key: 'Call contract', value: 'add soon' },
        details: []
      }] // TODO: extract detailed actions
    case 'UNSIGNED_TX':
      return [{
        header: { key: 'Raw transaction', value: 'add soon' },
        details: []
      }] // TODO: extract detailed actions
  }
}

export interface TransactionActionsProps {
  transaction: ReviewTransactionResult
}

export const TransactionActions: FC<TransactionActionsProps> = ({
  transaction
}) => {
  const transactions = extractActions(transaction)
  return (
    <Box borderRadius="xl">
      <Box backgroundColor="neutrals.700" px="3" py="2.5" borderTopRadius="xl">
        <P4 fontWeight="bold" color="neutrals.100">
          Actions
        </P4>
      </Box>
      <Accordion
        allowToggle
        backgroundColor="neutrals.800"
        pt="3.5"
        borderBottomRadius="xl"
      >
        {transactions.map((transaction, txIndex) => (
          <AccordionItem
            key={txIndex}
            border="none"
            color="white"
            isDisabled={
              transaction.details.length === 0
            }
          >
            {({ isDisabled, isExpanded }) => (
              <>
                <h2>
                  <AccordionButton
                    display="flex"
                    width="100%"
                    justifyContent="space-between"
                    outline="none"
                    px="3"
                    pb={txIndex !== transactions.length - 1 ? "3" : "3.5"}
                    _expanded={{
                      backgroundColor: "neutrals.700",
                      pb: "3.5",
                    }}
                    disabled={
                      transaction.details.length === 0
                    }
                    _disabled={{
                      cursor: "auto",
                      opacity: 1,
                    }}
                    _hover={{
                      backgroundColor: isDisabled ? "" : "neutrals.700",
                      borderBottomRadius:
                        txIndex === transactions.length - 1 && !isExpanded
                          ? "xl"
                          : "0",
                    }}
                  >
                    <P4 fontWeight="bold">
                      {entryPointToHumanReadable(transaction.header.key)}
                    </P4>
                    <P4 color="neutrals.400" fontWeight="bold">
                      {formatTruncatedAddress(transaction.header.value)}
                    </P4>
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  backgroundColor="neutrals.700"
                  borderBottomRadius={
                    txIndex === transactions.length - 1 ? "xl" : "0"
                  }
                  px="3"
                  pb="0"
                >
                  <Divider color="black" opacity="1" />
                  <Flex flexDirection="column" gap="12px" py="3.5">
                    {transaction.details.map((detail, cdIndex) => (
                      <Flex
                        key={cdIndex}
                        justifyContent="space-between"
                        gap="2"
                      >
                        <P4 color="neutrals.300" fontWeight="bold">
                          detail.key
                        </P4>
                        <P4
                          color="neutrals.400"
                          fontWeight="bold"
                          maxWidth="70%"
                        >
                          <CopyTooltip copyValue={detail.value} prompt={detail.value}>
                            <Box
                              _hover={{
                                bg: "neutrals.700",
                                color: "text",
                                cursor: "pointer",
                              }}
                              whiteSpace="nowrap"
                              textOverflow="ellipsis"
                              overflow="hidden"
                              minWidth="0"
                            >
                              {number.isHex(detail.value)
                                ? formatTruncatedAddress(detail.value)
                                : detail.value}
                            </Box>
                          </CopyTooltip>
                        </P4>
                      </Flex>
                    ))}
                  </Flex>
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  )
}
