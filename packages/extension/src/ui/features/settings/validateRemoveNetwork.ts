import i18n from "../../../i18n"
import { getNetworkSelector } from "../../../shared/account/selectors"
import { accountStore } from "../../../shared/account/store"
import { useAppState } from "../../app.state"

export const validateRemoveNetwork = async (networkId: string) => {
  const { switcherNetworkId } = useAppState.getState()
  if (switcherNetworkId === networkId) {
    throw new Error(
      i18n.t("Network {{ networkId }} is the current network. Change networks before deleting.", { networkId })
    )
  }

  const accountsOnNetwork = await accountStore.get(
    getNetworkSelector(networkId),
  )
  if (accountsOnNetwork.length) {
    throw new Error(
      i18n.t("networkAccounts", { count: accountsOnNetwork.length, networkId })
    )
  }

  return true
}
