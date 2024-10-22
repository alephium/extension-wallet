import { KeyType } from "@alephium/web3"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { getAccounts, selectAccount } from "../../services/backgroundAccounts"
import { recover } from "../recovery/recovery.service"
import { createAccount } from "./accounts.service"
import { importNewLedgerAccount } from '../../services/backgroundAccounts'
import { WalletAccount } from "../../../shared/wallet.model"

export const useAddAccount = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  const addAccount = useCallback(async (keyType: KeyType, group?: number) => {
    const newAccount = await createAccount(switcherNetworkId, keyType, undefined, group)
    // switch background wallet to the account that was selected
    await selectAccount(newAccount)
    navigate(await recover())
  }, [navigate, switcherNetworkId])

  return { addAccount }
}

export const addLedgerAccount = async (account: WalletAccount) => {
  await importNewLedgerAccount(account)
  // switch background wallet to the account that was selected
  await selectAccount({ address: account.address, networkId: account.networkId })
}

export const getAllLedgerAccounts = async (networkId: string) => {
  const accounts = await getAccounts()
  return accounts.filter((account) => account.networkId === networkId && account.signer.type === "ledger")
}
