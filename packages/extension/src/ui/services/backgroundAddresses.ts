import { sendMessage, waitForMessage } from "../../shared/messages"

export const createNewAddress = async (group?: number) => {
  sendMessage({ type: "NEW_ACCOUNT", data: group })
  return await Promise.race([
    waitForMessage("NEW_ACCOUNT_RES"),
    waitForMessage("NEW_ACCOUNT_REJ"),
  ])
}

export const getLastSelectedAddress = async () => {
  sendMessage({ type: "GET_SELECTED_ACCOUNT" })
  return waitForMessage("GET_SELECTED_ACCOUNT_RES")
}

export const getAddresses = async () => {
  sendMessage({ type: "GET_ACCOUNTS" })
  return waitForMessage("GET_ACCOUNTS_RES")
}

export const getBalance = async (address: string) => {
  sendMessage({ type: "GET_ACCOUNT_BALANCE", data: { address } })
  return waitForMessage("GET_ACCOUNT_BALANCE_RES")
}
