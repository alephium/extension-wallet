import { KeyType } from "@alephium/web3"
import { ethers } from "ethers"
import { number } from "starknet"

import { generateAvatarImage } from "../../../shared/avatarImage"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { startSession } from "../../services/backgroundSessions"
import { Account } from "./Account"
import i18n from "../../../i18n"

const { toBN } = number

export const createAccount = async (networkId: string, keyType: KeyType, password?: string, group?: number) => {
  if (password) {
    await startSession(password)
  }

  return Account.create(networkId, keyType, group)
}

const argentColorsArray = [
  "02BBA8",
  "29C5FF",
  "0078A4",
  "FFBF3D",
  "FFA85C",
  "FF875B",
  "FF675C",
  "FF5C72",
]

export const getColor = (name: string) => {
  const hash = ethers.utils.id(name).slice(-2)
  const index = parseInt(hash, 16) % argentColorsArray.length
  return argentColorsArray[index]
}

export const getAccountImageUrl = (
  accountName: string,
  account: BaseWalletAccount,
) => {
  return getNetworkAccountImageUrl({
    accountName,
    networkId: account.networkId,
    accountAddress: account.address,
  })
}

export const stripAddressZeroPadding = (accountAddress: string) => {
  try {
    return number.toHex(toBN(number.hexToDecimalString(accountAddress)))
  } catch {
    // ignore parsing errors
  }
  return ""
}

export const getNetworkAccountImageUrl = ({
  accountName,
  networkId,
  accountAddress,
  backgroundColor,
}: {
  accountName: string
  networkId: string
  accountAddress: string
  backgroundColor?: string
}) => {
  const accountIdentifier = `${networkId}::${accountAddress}`
  const background = backgroundColor || getColor(accountIdentifier)
  return generateAvatarImage(accountName, { background })
}

export type AccountStatusCode = "CONNECTED" | "DEFAULT" | "ERROR"

export interface AccountStatus {
  code: AccountStatusCode
  text: string
}

export const getStatus = (
  account: Account,
  activeAccount?: BaseWalletAccount,
): AccountStatus => {
  if (activeAccount && accountsEqual(account, activeAccount)) {
    return { code: "CONNECTED", text: i18n.t("Active") }
  }
  return { code: "DEFAULT", text: "" }
}
