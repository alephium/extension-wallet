import i18n from "../../../../../../i18n"
import { IExplorerTransactionTransformer } from "./type"

export default function ({
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (
    fingerprint === "events[Upgraded] calls[upgrade]" ||
    fingerprint === "events[account_upgraded] calls[upgrade]"
  ) {
    const entity = "ACCOUNT"
    const action = "UPGRADE"
    const displayName = i18n.t("Upgrade account")
    result = {
      ...result,
      action,
      entity,
      displayName,
    }
    return result
  }
}
