import { KeyType } from "@alephium/web3"
import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { selectAccount } from "../../services/backgroundAccounts"
import { recover } from "../recovery/recovery.service"
import { createAccount } from "./accounts.service"

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
