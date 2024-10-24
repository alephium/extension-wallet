import { L1, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { Account } from "../accounts/Account"
import { LedgerAlephium } from "../ledger/utils"

const { AlertIcon } = icons

export type LedgerState = "detecting" | "notfound" | "signing" | "succeeded" | "failed"

export const LedgerStatus = ({ ledgerState }: { ledgerState: LedgerState | undefined }): JSX.Element => {
  const { t } = useTranslation()
  return (
    ledgerState === "notfound" ?
      <Flex
        direction="column"
        backgroundColor="#330105"
        boxShadow="menu"
        py="3.5"
        px="3.5"
        borderRadius="xl"
      >
        <Flex gap="1" align="center">
          <Text color="errorText">
            <AlertIcon />
          </Text>
          <L1 color="errorText">{t("The Ledger app is not connected")}</L1>
        </Flex>
      </Flex>
      : <></>
  )
}

export type LedgerConfirmation = "Sign with Ledger" | "Ledger: Detecting" | "Ledger: Signing" | "Ledger: Succeeded" | "Ledger: Failed"
export function getConfirmationTextByState(ledgerState: LedgerState | undefined): LedgerConfirmation {
  return ledgerState === undefined
    ? "Sign with Ledger"
    : (ledgerState === "detecting") || (ledgerState === "notfound")
    ? "Ledger: Detecting"
    : ledgerState === "signing"
    ? "Ledger: Signing"
    : ledgerState === "succeeded"
    ? "Ledger: Succeeded"
    : "Ledger: Failed"
}

export function useLedgerApp({
  selectedAccount,
  unsignedTx,
  onSubmit,
  navigate,
  onReject,
} : {
  selectedAccount: Account | undefined,
  unsignedTx: string | undefined,
  onSubmit: (signature: string) => void,
  navigate: (n: number) => void,
  onReject?: () => void
}) {
  const [ledgerState, setLedgerState] = useState<LedgerState>()
  const [ledgerApp, setLedgerApp] = useState<LedgerAlephium>()

  const ledgerSign = useCallback(async () => {
    if (selectedAccount === undefined) {
      return
    }
    setLedgerState(oldState => oldState === undefined ? "detecting" : oldState)

    let app: LedgerAlephium | undefined
    if (unsignedTx !== undefined) {
      try {
        app = await LedgerAlephium.create()
        setLedgerApp(app)
        setLedgerState("signing")
        const signature = await app.signUnsignedTx(selectedAccount, Buffer.from(unsignedTx, "hex"))
        setLedgerState("succeeded")
        onSubmit(signature)
      } catch (e) {
        if (app === undefined) {
          setLedgerState(oldState => oldState === undefined || oldState === "detecting" ? "notfound" : oldState)
          setTimeout(ledgerSign, 1000)
        } else {
          await app.close()
          setLedgerState("failed")
          if (onReject !== undefined) {
            onReject()
          } else {
            navigate(-1)
          }
        }
      }
    }
  }, [selectedAccount, onSubmit, onReject, navigate, unsignedTx])

  return { ledgerState, ledgerApp, ledgerSign }
}
