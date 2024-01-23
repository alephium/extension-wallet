import { defaultNetwork } from "../../../shared/network"
import { accountsEqual } from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import {
  accountsOnNetwork,
  getAccounts,
  getLastSelectedAccount,
  selectAccount,
} from "../../services/backgroundAccounts"
import { setDefaultAccountNames } from "../accounts/accountMetadata.state"
import { mapWalletAccountsToAccounts } from "../accounts/accounts.state"

interface RecoveryOptions {
  networkId?: string
  showHiddenAccountList?: boolean
}

export const recover = async ({
  networkId,
  showHiddenAccountList,
}: RecoveryOptions = {}) => {
  try {
    const lastSelectedAccount = await getLastSelectedAccount()
    networkId ??= lastSelectedAccount?.networkId ?? defaultNetwork.id

    const allAccounts = await getAccounts(true)
    const walletAccounts = accountsOnNetwork(allAccounts, networkId)
    const selectedWalletAccount = walletAccounts.find(
      (account) =>
        lastSelectedAccount && accountsEqual(account, lastSelectedAccount)
    )
    const firstUnhiddenAccount = walletAccounts.find((wa) => !wa.hidden)

    const selectedAccount = !selectedWalletAccount?.hidden
      ? selectedWalletAccount
      : firstUnhiddenAccount
    const accounts = mapWalletAccountsToAccounts(walletAccounts)

    setDefaultAccountNames(accounts)
    await selectAccount(selectedAccount)
    useAppState.setState({ switcherNetworkId: networkId })

    if (showHiddenAccountList && networkId) {
      return routes.accountsHidden(networkId)
    }

    return routes.accountTokens()
  } catch (e: any) {
    console.error("Recovery error:", e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}
