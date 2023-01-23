import create from "zustand"
import { persist } from "zustand/middleware"

import type { Account } from "./Account"

export const defaultAccountName = "Unnamed account"

// account information that's not saved in the backup file, but persisted in the extension's localstorage
interface State {
  accountNames: Record<string, Record<string, string>>
  setAccountName: (networkId: string, address: string, name: string) => void
}

export const useAccountMetadata = create<State>(
  persist(
    (set, _get) => ({
      accountNames: {},
      setAccountName: (networkId: string, address: string, name: string) =>
        set((state) => ({
          accountNames: {
            ...state.accountNames,
            [networkId]: {
              ...state.accountNames[networkId],
              [address]: name,
            },
          },
        })),
    }),
    { name: "accountMetadata" },
  ),
)

export const getAccountName = (
  { address, networkId }: Account,
  accountNames: Record<string, Record<string, string>>,
): string => accountNames[networkId]?.[address] || defaultAccountName

export const setDefaultAccountNames = (accounts: Account[]) => {
  const { accountNames } = useAccountMetadata.getState()
  let names = accountNames
  for (const account of accounts) {
    const { networkId } = account
    if (!names[networkId]?.[account.address]) {
      const name = `Account ${
        accounts.map((a) => a.address).indexOf(account.address) + 1
      }`
      names = {
        ...names,
        [networkId]: { ...names[networkId], [account.address]: name },
      }
    }
  }
  useAccountMetadata.setState({ accountNames: names })
}
