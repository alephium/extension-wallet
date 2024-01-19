import browser from "webextension-polyfill"
import { getNetwork } from "../shared/network"

import { ArrayStorage } from "../shared/storage"
import { Status, TransactionMeta } from "../shared/transactions"
import { getExplorerTransactionLink } from "../ui/services/blockExplorer.service"

const notificationsStorage = new ArrayStorage<string>(
  [],
  "core:notifications:seenTransactions",
)

export async function hasShownNotification(hash: string) {
  const [hit] = await notificationsStorage.get((h) => h === hash)
  return !!hit
}

export async function addToAlreadyShown(hash: string) {
  await notificationsStorage.push(hash)
}

browser.notifications.onClicked.addListener((id: string) => {
  const splitted = id.split(":")
  if (splitted[0] === "TX") {
    const txId = splitted[1]
    const networkId = splitted[2]
    getNetwork(networkId).then((network) => {
      if (network.explorerUrl) {
        browser.tabs.create({
          url: getExplorerTransactionLink(network.explorerUrl, txId)
        })
      }
    })
  }
})

export async function sentTransactionNotification(
  hash: string,
  status: Status,
  networkId: string,
  meta?: TransactionMeta,
) {
  const id = `TX:${hash}:${networkId}`
  const title = `${meta?.title || "Transaction"} ${
    ["ACCEPTED_ON_CHAIN", "ACCEPTED_ON_MEMPOOL", "PENDING"].includes(status)
      ? "succeeded"
      : "rejected"
  }`
  return browser.notifications.create(id, {
    type: "basic",
    title,
    message: `${hash}\nStatus: ${status}`,
    iconUrl: "./assets/favicon-128.png",
    eventTime: Date.now(),
  })
}
