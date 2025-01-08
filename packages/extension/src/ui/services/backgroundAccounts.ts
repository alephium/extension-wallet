import { KeyType } from "@alephium/web3"
import { sendMessage, waitForMessage } from "../../shared/messages"
import {
  ArgentAccountType,
  BaseWalletAccount,
  WalletAccount,
} from "../../shared/wallet.model"
import { walletStore } from "../../shared/wallet/walletStore"
import { decryptFromBackground, generateEncryptedSecret } from "./crypto"
import i18n from "../../i18n"

export const createNewAccount = async (networkId: string, keyType: KeyType, group?: number) => {
  sendMessage({ type: "ALPH_NEW_ACCOUNT", data: { networkId: networkId, keyType: keyType, group: group } })
  try {
    return await Promise.race([
      waitForMessage("ALPH_NEW_ACCOUNT_RES"),
      waitForMessage("ALPH_NEW_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error(i18n.t("Could not add new account"))
  }
}

export const discoverAccounts = async (networkId: string) => {
  sendMessage({ type: "ALPH_DISCOVER_ACCOUNTS", data: { networkId } })
  try {
    return await Promise.race([
      waitForMessage("ALPH_DISCOVER_ACCOUNTS_RES"),
      waitForMessage("ALPH_DISCOVER_ACCOUNTS_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error(i18n.t("Could not discover active accounts for {{ networkId }}.", { networkId }))
  }
}

export const importNewLedgerAccount = async (account: WalletAccount) => {
  sendMessage({ type: "ALPH_NEW_LEDGER_ACCOUNT", data: { account } })
  try {
    return await Promise.race([
      waitForMessage("ALPH_NEW_LEDGER_ACCOUNT_RES"),
      waitForMessage("ALPH_NEW_LEDGER_ACCOUNT_REJ").then(() => "error" as const),
    ])
  } catch {
    throw Error(i18n.t("Could not add new ledger account"))
  }
}

export const getLastSelectedAccount = async () => {
  sendMessage({ type: "ALPH_GET_SELECTED_ACCOUNT" })
  return waitForMessage("ALPH_GET_SELECTED_ACCOUNT_RES")
}

export const getAccounts = async (showHidden = false) => {
  sendMessage({ type: "ALPH_GET_ACCOUNTS", data: { showHidden } })
  return waitForMessage("ALPH_GET_ACCOUNTS_RES")
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
    type: "ALPH_CONNECT_ACCOUNT",
    data: account,
  })
}

export const deleteAccount = async (address: string, networkId: string) => {
  sendMessage({
    type: "ALPH_DELETE_ACCOUNT",
    data: { address, networkId },
  })

  try {
    await Promise.race([
      waitForMessage("ALPH_DELETE_ACCOUNT_RES"),
      waitForMessage("ALPH_DELETE_ACCOUNT_REJ").then(() => {
        throw new Error(i18n.t("Rejected"))
      }),
    ])
  } catch {
    throw Error(i18n.t("Could not delete account"))
  }
}

export const upgradeAccount = async (
  wallet: BaseWalletAccount,
  targetImplementationType?: ArgentAccountType,
) => {
  sendMessage({
    type: "ALPH_UPGRADE_ACCOUNT",
    data: { wallet, targetImplementationType },
  })
  try {
    await Promise.race([
      waitForMessage("ALPH_UPGRADE_ACCOUNT_RES"),
      waitForMessage("ALPH_UPGRADE_ACCOUNT_REJ").then(() => {
        throw new Error(i18n.t("Rejected"))
      }),
    ])
  } catch {
    throw Error(i18n.t("Could not upgrade account"))
  }
}

export const getPrivateKey = async () => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "ALPH_GET_ENCRYPTED_PRIVATE_KEY",
    data: { encryptedSecret },
  })

  const { encryptedPrivateKey } = await waitForMessage(
    "ALPH_GET_ENCRYPTED_PRIVATE_KEY_RES",
  )

  return await decryptFromBackground(encryptedPrivateKey, secret)
}

export const getSeedPhrase = async (): Promise<string> => {
  const { secret, encryptedSecret } = await generateEncryptedSecret()
  sendMessage({
    type: "ALPH_GET_ENCRYPTED_SEED_PHRASE",
    data: { encryptedSecret },
  })

  const { encryptedSeedPhrase } = await waitForMessage(
    "ALPH_GET_ENCRYPTED_SEED_PHRASE_RES",
  )

  return await decryptFromBackground(encryptedSeedPhrase, secret)
}
