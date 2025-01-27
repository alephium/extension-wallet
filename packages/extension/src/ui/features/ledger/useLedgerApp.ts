import { useCallback, useState } from "react"
import { Account } from "../accounts/Account"
import { LedgerAlephium } from "../ledger/utils"
import { LedgerState } from "./types"

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