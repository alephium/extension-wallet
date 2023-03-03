import { Destination, prettifyAttoAlphAmount } from "@alephium/web3"
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
import { ReviewTransactionResult } from "../../../../shared/actionQueue/types"

import { entryPointToHumanReadable } from "../../../../shared/transactions"
import { formatTruncatedAddress, formatLongString } from "../../../services/addresses"

export interface TransactionActionRow {
  key: string
  value: string
}
export interface TransactionAction {
  header: TransactionActionRow
  details: TransactionActionRow[]
}


function getTokensFromDestination(destination: Destination): TransactionActionRow[] {
  return [{ key: 'ALPH', value: prettifyAttoAlphAmount(destination.attoAlphAmount) ?? '?' },
    ...(destination.tokens ?? []).map(token => ({ key: token.id, value: token.amount.toString() }))]
}

export function extractActions(transaction: ReviewTransactionResult): TransactionAction[] {
  switch (transaction.type) {
    case 'TRANSFER':
      return transaction.params.destinations.map((destination) => {
        return {
          header: { key: 'Send', value: formatTruncatedAddress(destination.address) },
          details: [{ key: 'Recipient', value: destination.address }, ...getTokensFromDestination(destination)]
        }
      })
    case 'DEPLOY_CONTRACT':
      return [{
        header: { key: 'Deploy contract', value: formatTruncatedAddress(transaction.result.contractAddress) },
        details: [
          {
            key: 'Bytecode',
            value: transaction.params.bytecode
          },
          {
            key: 'Group',
            value: `${transaction.result.groupIndex}`
          },
        ]
      }]
    case 'EXECUTE_SCRIPT':
      return [{
        header: { key: 'Call smart contracts', value: '' },
        details: [
          {
            key: 'Bytecode',
            value: transaction.params.bytecode
          },
          {
            key: 'Group',
            value: `${transaction.result.groupIndex}`
          }
        ]
      }]
    case 'UNSIGNED_TX':
      return [{
        header: { key: 'Sign raw transaction', value: '' },
        details: [
          {
            key: 'Unsigned Tx',
            value: transaction.params.unsignedTx
          },
          {
            key: 'Group',
            value: `${transaction.result.fromGroup} -> ${transaction.result.toGroup}`
          }
        ]
      }]
  }
}

export interface TransactionActionsProps {
  transaction: ReviewTransactionResult
}

export const TransactionActions: FC<TransactionActionsProps> = ({
  transaction
}) => {
  const transactionActions = extractActions(transaction)
  return (
    <Box borderRadius="xl">
      <Box backgroundColor="neutrals.700" px="3" py="2.5" borderTopRadius="xl">
        <P4 fontWeight="bold" color="neutrals.100">
          Actions
        </P4>
      </Box>
      <Accordion
        allowToggle
        allowMultiple
        defaultIndex={0}
        backgroundColor="neutrals.800"
        pt="3.5"
        borderBottomRadius="xl"
      >
        {transactionActions.map((transactionAction, txIndex) => (
          <AccordionItem
            key={txIndex}
            border="none"
            color="white"
            isDisabled={
              transactionAction.details.length === 0
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
                    pb={txIndex !== transactionActions.length - 1 ? "3" : "3.5"}
                    _expanded={{
                      backgroundColor: "neutrals.700",
                      pb: "3.5",
                    }}
                    disabled={
                      transactionAction.details.length === 0
                    }
                    _disabled={{
                      cursor: "auto",
                      opacity: 1,
                    }}
                    _hover={{
                      backgroundColor: isDisabled ? "" : "neutrals.700",
                      borderBottomRadius:
                        txIndex === transactionActions.length - 1 && !isExpanded
                          ? "xl"
                          : "0",
                    }}
                  >
                    <P4 fontWeight="bold">
                      {entryPointToHumanReadable(transactionAction.header.key)}
                    </P4>
                    {
                      transactionAction.header.value && (
                        <P4 color="neutrals.400" fontWeight="bold">
                          {transactionAction.header.value}
                        </P4>
                      )
                    }
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  backgroundColor="neutrals.700"
                  borderBottomRadius={
                    txIndex === transactionActions.length - 1 ? "xl" : "0"
                  }
                  px="3"
                  pb="0"
                >
                  <Divider color="black" opacity="1" />

                  <Flex flexDirection="column" gap="12px" py="3.5">
                    {transactionAction.details.map((detail, cdIndex) => (
                      <Flex
                        key={cdIndex}
                        justifyContent="space-between"
                        gap="2"
                      >
                        <P4 color="neutrals.300" fontWeight="bold">
                          {formatLongString(detail.key, 5)}
                        </P4>
                        <P4
                          color="neutrals.400"
                          fontWeight="bold"
                          maxWidth="50%"
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
                              {detail.value}
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
