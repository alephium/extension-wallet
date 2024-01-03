import { KeyType, Account } from "@alephium/web3"
import { sendMessage, waitForMessage } from "../../shared/messages"
import {
  ArgentAccountType,
  BaseWalletAccount,
  WalletAccount,
} from "../../shared/wallet.model"
import { walletStore } from "../../shared/wallet/walletStore"
import { decryptFromBackground, generateEncryptedSecret } from "./crypto"

export const createNewAccount = async (networkId: string, keyType: KeyType, group?: number) => {
  sendMessage({ type: "NEW_ACCOUNT", data: { networkId: networkId, keyType: keyType, group: group } })
  try {
    return await Promise.race([
      waitForMessage("NEW_ACCOUNT_RES"),
      waitForMessage("NEW_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error("Could add new account")
  }
}

export const createPasskeyAccount = async (networkId: string, publicKey: string) => {
  sendMessage({ type: "NEW_PASSKEY_ACCOUNT", data: { networkId, publicKey } })
  try {
    return await Promise.race([
      waitForMessage("NEW_PASSKEY_ACCOUNT_RES"),
      waitForMessage("NEW_PASSKEY_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error("Could add new passkey account")
  }
}

export const importNewLedgerAccount = async (account: Account, hdIndex: number, networkId: string) => {
  sendMessage({ type: "NEW_LEDGER_ACCOUNT", data: { account, hdIndex, networkId } })
  try {
    return await Promise.race([
      waitForMessage("NEW_LEDGER_ACCOUNT_RES"),
      waitForMessage("NEW_LEDGER_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error("Could add new account")
  }
}

export const getLastSelectedAccount = async () => {
  sendMessage({ type: "GET_SELECTED_ACCOUNT" })
  return waitForMessage("GET_SELECTED_ACCOUNT_RES")
}

export const getAccounts = async (showHidden = false) => {
  sendMessage({ type: "GET_ACCOUNTS", data: { showHidden } })
  return waitForMessage("GET_ACCOUNTS_RES")
}

export const accountsOnNetwork = (
  accounts: WalletAccount[],
  networkId: string,
) => accounts.filter((account) => account.networkId === networkId)

export const selectAccount = async (
  account?: BaseWalletAccount,
): Promise<void> => {
  await walletStore.set("selected", account ?? null)

  return connectAccount(account)
}

export const connectAccount = (account?: BaseWalletAccount) => {
  sendMessage({
    type: "CONNECT_ACCOUNT",
    data: account,
  })
}

export const deleteAccount = async (address: string, networkId: string) => {
  sendMessage({
    type: "DELETE_ACCOUNT",
    data: { address, networkId },
  })

  try {
    await Promise.race([
      waitForMessage("DELETE_ACCOUNT_RES"),
      waitForMessage("DELETE_ACCOUNT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw Error("Could not delete account")
  }
}

export const upgradeAccount = async (
  wallet: BaseWalletAccount,
  targetImplementationType?: ArgentAccountType,
) => {
  sendMessage({
    type: "UPGRADE_ACCOUNT",
    data: { wallet, targetImplementationType },
  })
  try {
    await Promise.race([
      waitForMessage("UPGRADE_ACCOUNT_RES"),
      waitForMessage("UPGRADE_ACCOUNT_REJ").then(() => {
        throw new Error("Rejected")
      }),
    ])
  } catch {
    throw Error("Could not upgrade account")
  }
}

export const getPrivateKey = async () => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "GET_ENCRYPTED_PRIVATE_KEY",
    data: { encryptedSecret },
  })

  const { encryptedPrivateKey } = await waitForMessage(
    "GET_ENCRYPTED_PRIVATE_KEY_RES",
  )

  return await decryptFromBackground(encryptedPrivateKey, secret)
}

export const getSeedPhrase = async (): Promise<string> => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "GET_ENCRYPTED_SEED_PHRASE",
    data: { encryptedSecret },
  })

  const { encryptedSeedPhrase } = await waitForMessage(
    "GET_ENCRYPTED_SEED_PHRASE_RES",
  )

  return await decryptFromBackground(encryptedSeedPhrase, secret)
}
