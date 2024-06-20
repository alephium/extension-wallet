import { IExplorerTransactionTransformer } from "./type"
import i18n from "../../../../../../i18n"

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (fingerprint === "events[Upgraded]" || fingerprint === "events[]") {
    const { maxFee, actualFee } = explorerTransaction
    if (!maxFee && actualFee === "0x0") {
      const entity = "ACCOUNT"
      const action = "CREATE"
      const displayName = i18n.t("Create account")
      result = {
        ...result,
        action,
        entity,
        displayName,
      }
      return result
    }
  }
}
