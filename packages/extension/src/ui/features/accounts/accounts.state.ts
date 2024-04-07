import { useMemo } from "react"

import {
  getNetworkSelector,
  withHiddenSelector,
  withoutHiddenSelector,
} from "../../../shared/account/selectors"
import { accountStore } from "../../../shared/account/store"
import { defaultNetwork } from "../../../shared/network"
import {
  useArrayStorage,
  useKeyValueStorage,
} from "../../../shared/storage/hooks"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { walletStore } from "../../../shared/wallet/walletStore"
import { useCurrentNetwork } from "../networks/useNetworks"
import { Account } from "./Account"

export const mapWalletAccountsToAccounts = (
  walletAccounts: WalletAccount[],
): Account[] => {
  return walletAccounts.map(
    (walletAccount) =>
      new Account({
        address: walletAccount.address,
        publicKey: walletAccount.signer.publicKey,
        networkId: walletAccount.networkId,
        signer: walletAccount.signer,
        hidden: walletAccount.hidden,
        type: walletAccount.type,
      }),
  )
}

export const useAccounts = ({
  showHidden = false,
  allNetworks = false,
} = {}) => {
  const network = useCurrentNetwork()
  const accounts = useArrayStorage(accountStore)

  const filteredAccounts = useMemo(
    () =>
      accounts
        .filter(
          allNetworks
            ? () => true
            : getNetworkSelector(network.id ?? defaultNetwork.id),
        )
        .filter(showHidden ? withHiddenSelector : withoutHiddenSelector),
    [network.id, showHidden, allNetworks, accounts],
  )

  return useMemo(() => {
    return mapWalletAccountsToAccounts(filteredAccounts)
  }, [filteredAccounts])
}

export const useAccountsOnNetwork = ({
  networkId,
  showHidden = false,
}: {
  networkId: string
  showHidden: boolean
}) => {
  const accounts = useArrayStorage(accountStore)

  const filteredAccounts = accounts
    .filter(getNetworkSelector(networkId))
    .filter(showHidden ? withHiddenSelector : withoutHiddenSelector)

  return mapWalletAccountsToAccounts(filteredAccounts)
}

export const useAccount = (
  account?: BaseWalletAccount,
): Account | undefined => {
  const network = useCurrentNetwork()
  const allNetworks = account?.networkId !== network.id
  const accounts = useAccounts({ showHidden: true, allNetworks })
  return useMemo(() => {
    if (!account) {
      return undefined
    }

    return accounts.find((a) => account && accountsEqual(a, account))
  }, [accounts, account])
}

export const isHiddenAccount = (account: Account) => !!account.hidden

// Use selected account from Wallet Store
export const useSelectedAccount = () => {
  const baseWalletAccount = useKeyValueStorage(walletStore, "selected")
  return useAccount(baseWalletAccount ?? undefined)
}
