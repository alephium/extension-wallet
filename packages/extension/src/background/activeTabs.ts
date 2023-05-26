import browser from "webextension-polyfill"

import { MessageType } from "../shared/messages"
import { sendMessage } from "../shared/messages"
import { ArrayStorage } from "../shared/storage"

interface Tab {
  id: number
  host: string
}

const activeTabs = new ArrayStorage<Tab>([], {
  namespace: "core:activeTabs",
  areaName: "session",
  compare(a, b) {
    return a.id === b.id
  },
})

browser.tabs.onRemoved.addListener(removeTab)

export async function addTab(tab: Tab) {
  if (tab.id !== undefined) {
    return activeTabs.push(tab)
  }
}

export function removeTab(tabId?: number) {
  return activeTabs.remove((tab) => tab.id === tabId)
}

export async function hasTab(tabId?: number) {
  if (tabId === undefined) {
    return false
  }
  const [hit] = await activeTabs.get((tab) => tab.id === tabId)
  return Boolean(hit)
}

export async function getTabIdsOfHost(host: string) {
  const hits = await activeTabs.get((tab) => tab.host === host)
  return hits ? hits.map((tab) => tab.id) : []
}

export async function sendMessageToHost(
  message: MessageType,
  host: string,
): Promise<void> {
  const tabIds = await getTabIdsOfHost(host)
  const tabs = await activeTabs.get((tab) => tabIds.includes(tab.id))
  await Promise.allSettled(tabs.map((tab) => sendMessage(message, { tabId: tab.id })))
}

export async function sendMessageToActiveTabs(
  message: MessageType,
  additionalTargets: Array<number | undefined> = [],
): Promise<void> {
  const promises = []
  const tabs = await activeTabs.get()
  for (const tabId of new Set([
    ...tabs.map((tab) => tab.id),
    ...additionalTargets,
  ])) {
    if (tabId !== undefined) {
      promises.push(sendMessage(message, { tabId }))
    }
  }
  await Promise.allSettled(promises)
}

export async function sendMessageToUi(message: MessageType) {
  await Promise.allSettled([sendMessage(message)])
}

export async function sendMessageToActiveTabsAndUi(
  message: MessageType,
  additionalTargets: Array<number | undefined> = [],
) {
  await sendMessageToUi(message)
  await sendMessageToActiveTabs(message, additionalTargets)
}
