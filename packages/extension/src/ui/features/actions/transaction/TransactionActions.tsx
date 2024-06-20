import { Token as Web3Token, Number256, prettifyAttoAlphAmount, prettifyTokenAmount } from "@alephium/web3"
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
import { AddressBookContact } from "../../../../shared/addressBook"
import { Token } from "../../../../shared/token/type"

import { entryPointToHumanReadable } from "../../../../shared/transactions"
import { useAddressBook } from "../../../services/addressBook"
import { formatTruncatedAddress, formatLongString } from "../../../services/addresses"
import { useAccountMetadata } from "../../accounts/accountMetadata.state"
import { getAccountNameForAddress, getContactNameForAddress } from "../../accounts/PrettyAccountAddress"
import { devnetToken, useTokensInNetwork } from "../../accountTokens/tokens.state"
import { useTranslation } from "react-i18next"

export interface TransactionActionRow {
  key: string
  value: string
}
export interface TransactionAction {
  header: TransactionActionRow
  details: TransactionActionRow[]
}

function getActionsFromAmounts(networkId: string, amounts: { attoAlphAmount?: Number256, tokens?: Web3Token[] }, tokensInNetwork: Token[]): TransactionActionRow[] {
  const tokenActions = (amounts.tokens ?? []).map(token => {
      const matchedToken = tokensInNetwork.find(t => t.id === token.id)
      if (matchedToken) {
        return {
          key: matchedToken.name,
          value: `${prettifyTokenAmount(token.amount, matchedToken.decimals) ?? '???'} ${matchedToken.symbol}`
        }
      } else if (networkId === "devnet") {
        const devToken = devnetToken({ id: token.id, networkId: networkId })
        return {
          key: devToken.name,
          value: `${token.amount.toString()} ${devToken.symbol}`
        }
      } else {
        return { key: "Token ???", value: token.amount.toString() }
      }
    })
  return amounts.attoAlphAmount !== undefined
    ? [{ key: 'Alephium', value: `${prettifyAttoAlphAmount(amounts.attoAlphAmount)} ALPH` ?? '?' }, ...tokenActions]
    : tokenActions
}

function prettifyAddressName(address: string, networkId: string, accountNames: Record<string, Record<string, string>>, contacts: AddressBookContact[]): [string, boolean] {
  const accountName = getAccountNameForAddress(
    address,
    networkId,
    accountNames,
  )
  if (accountName) {
    return [accountName, true]
  }
  const contactName = getContactNameForAddress(
    address,
    networkId,
    contacts
  )
  if (contactName) {
    return [contactName, true]
  }

  return [address, false]
}

export function useExtractActions(transaction: ReviewTransactionResult, networkId: string, tokensInNetwork: Token[]): TransactionAction[] {
  const { t } = useTranslation()
  const accountNames = useAccountMetadata((x) => x.accountNames)
  const { contacts } = useAddressBook()
  let addressName: string
  let found: boolean
  switch (transaction.type) {
    case 'TRANSFER':
      return transaction.params.destinations.map((destination) => {
        [addressName, found] = prettifyAddressName(destination.address, networkId, accountNames, contacts)
        return {
          header: { key: t('Send'), value: found ? '' : formatTruncatedAddress(destination.address) },
          details: [{ key: `${t('To')}:`, value: addressName }, ...getActionsFromAmounts(networkId, destination, tokensInNetwork)]
        }
      })
    case 'DEPLOY_CONTRACT':
      return [{
        header: { key: t('Deploy contract'), value: formatTruncatedAddress(transaction.result.contractAddress) },
        details: [
          {
            key: t('Bytecode'),
            value: transaction.params.bytecode
          },
          {
            key: t('Group'),
            value: `${transaction.result.groupIndex}`
          },
        ]
      }]
    case 'EXECUTE_SCRIPT':
      return [{
        header: { key: t('Call smart contracts'), value: '' },
        details: [
          {
            key: t('Bytecode'),
            value: transaction.params.bytecode
          },
          {
            key: t('Group'),
            value: `${transaction.result.groupIndex}`
          },
          ...getActionsFromAmounts(networkId, transaction.params, tokensInNetwork)
        ]
      }]
    case 'UNSIGNED_TX':
      return [{
        header: { key: t('Sign raw transaction'), value: '' },
        details: [
          {
            key: t('Unsigned Tx'),
            value: transaction.params.unsignedTx
          },
          {
            key: t('Group'),
            value: `${transaction.result.fromGroup} -> ${transaction.result.toGroup}`
          }
        ]
      }]
  }
}

export interface TransactionActionsProps {
  networkId: string
  transaction: ReviewTransactionResult
}

export const TransactionActions: FC<TransactionActionsProps> = ({
  networkId,
  transaction
}) => {
  const tokensInNetwork = useTokensInNetwork(networkId)
  const transactionActions = useExtractActions(transaction, networkId, tokensInNetwork)
  return (
    <Box borderRadius="xl">
      <Box backgroundColor="neutrals.700" px="3" py="1" borderTopRadius="xl">
      </Box>
      <Accordion
        allowToggle
        allowMultiple
        defaultIndex={0}
        backgroundColor="neutrals.800"
        pt="0"
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
                    pb={txIndex !== transactionActions.length - 1 ? "2" : "2.5"}
                    _expanded={{
                      backgroundColor: "neutrals.700",
                      pb: "1.5",
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
