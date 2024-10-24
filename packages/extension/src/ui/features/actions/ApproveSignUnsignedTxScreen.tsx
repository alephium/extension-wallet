import { binToHex, hexToBinUnsafe, SignUnsignedTxParams } from "@alephium/web3"
import { H6, H2, P4, CopyTooltip } from "@argent/ui"
import { FC, useCallback } from "react"

import { ConfirmPageProps } from "./DeprecatedConfirmScreen"
import { Box, Flex, VStack } from "@chakra-ui/react"
import { ConfirmScreen } from "./ConfirmScreen"
import { AccountNetworkInfo } from "./transaction/AccountNetworkInfo"
import blake from 'blakejs'
import { TxHashContainer } from "./TxHashContainer"
import { useTranslation } from "react-i18next"
import { LedgerStatus } from "./LedgerStatus"
import { useNavigate } from "react-router-dom"
import { useLedgerApp } from "../ledger/useLedgerApp"
import { getConfirmationTextByState } from "../ledger/types"

interface ApproveSignUnsignedTxScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  params: SignUnsignedTxParams & { host: string }
  onSubmit: (result: { signatureOpt: string | undefined }) => void
}

export const ApproveSignUnsignedTxScreen: FC<ApproveSignUnsignedTxScreenProps> = ({
  params,
  onSubmit,
  onReject,
  selectedAccount,
  ...props
}) => {
  const { t } = useTranslation()
  const txId = binToHex(blake.blake2b(hexToBinUnsafe(params.unsignedTx), undefined, 32))

  const navigate = useNavigate()
  const useLedger = selectedAccount !== undefined && selectedAccount.signer.type === "ledger"
  const ledgerSubmit = useCallback((signature: string) => {
    onSubmit({ signatureOpt: signature })
  }, [onSubmit])
  const { ledgerState, ledgerApp, ledgerSign } = useLedgerApp({
    selectedAccount,
    unsignedTx: params.unsignedTx,
    onSubmit: ledgerSubmit,
    navigate,
    onReject
  })

  return (
    <ConfirmScreen
      confirmButtonText={!useLedger ? t("Sign") : t(getConfirmationTextByState(ledgerState))}
      confirmButtonDisabled={ledgerState !== undefined}
      confirmButtonBackgroundColor="neutrals.800"
      rejectButtonText="Cancel"
      showHeader={false}
      scrollable={false}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        if (useLedger) {
          ledgerSign()
        } else {
          onSubmit({ signatureOpt: undefined })
        }
      }}
      onReject={() => {
        if (ledgerApp !== undefined) {
          ledgerApp.close()
        }
        if (onReject !== undefined) {
          onReject()
        } else {
          navigate(-1)
        }
      }}
      footer={
        <Flex direction="column" gap="1">
          <LedgerStatus ledgerState={ledgerState} />
        </Flex>
      }
      {...props}
    >
      {
        params.host &&
        <Flex
        direction="column"
        justifyContent="center"
        alignItems="center"
        mb="6"
        mt="3"
        gap="6"
        >
          <H2>{t("Sign Raw TX")}</H2>
          <H6>{params.host}</H6>
        </Flex>
      }
      { selectedAccount &&
        <AccountNetworkInfo account={selectedAccount}/>
      }
      <TxHashContainer txId={txId}/>
      {
        <VStack
          borderRadius="xl"
          backgroundColor="neutrals.800"
          gap="3"
          px="3"
          py="3.5"
        >
          <Flex
            justifyContent="space-between"
            w="full"
          >
            <P4 color="neutrals.300" fontWeight="bold">
              {t("Raw TX")}
            </P4>
            <P4
              color="neutrals.400"
              fontWeight="bold"
              maxWidth="60%"
            >
              <CopyTooltip copyValue={params.unsignedTx} prompt={params.unsignedTx}>
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
                  {params.unsignedTx}
                </Box>
              </CopyTooltip>
            </P4>
          </Flex>
        </VStack>
      }
      <Box w="full" h={20} />
    </ConfirmScreen>
  )
}
