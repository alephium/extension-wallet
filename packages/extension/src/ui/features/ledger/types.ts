export type LedgerState = "detecting" | "notfound" | "signing" | "succeeded" | "failed"
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