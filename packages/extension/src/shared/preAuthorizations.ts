import { groupOfAddress, KeyType } from "@alephium/web3"
import { isArray, pick } from "lodash-es"
import browser from "webextension-polyfill"
import { RequestOptions } from "../inpage/inpage.model"

import { accountStore } from "./account/store"
import { ArrayStorage } from "./storage"
import { useArrayStorage } from "./storage/hooks"
import { BaseWalletAccount } from "./wallet.model"
import { accountsEqual } from "./wallet.service"

const CONNECTION_EXPIRY = 7 * 24 * 60 // 7 days in minutes

interface PreAuthorization {
  account: BaseWalletAccount
  host: string
}
export const equalPreAuthorization = (
  a: PreAuthorization,
  b: PreAuthorization,
) => accountsEqual(a.account, b.account) && a.host === b.host

export const preAuthorizeStore = new ArrayStorage<PreAuthorization>([], {
  namespace: `core:whitelist`,
  compare: equalPreAuthorization,
})

async function getFromStorage<T, K extends string = string>(
  key: K,
): Promise<T | null> {
  try {
    return JSON.parse((await browser.storage.local.get(key))[key]) ?? null
  } catch {
    return null
  }
}
export const migratePreAuthorizations = async () => {
  try {
    const old = await getFromStorage<string[]>("PREAUTHORIZATION:APPROVED")
    if (isArray(old) && old.length > 0) {
      await browser.storage.local.remove("PREAUTHORIZATION:APPROVED")
      const allAccounts = await accountStore.get()

      const accountHostCombinations = old.flatMap((h) =>
        allAccounts.map((a) => ({
          account: pick(a, "address", "networkId"),
          host: h,
        })),
      )

      return preAuthorizeStore.push(accountHostCombinations)
    }
  } catch {
    console.error("Failed to migrate preauthorizations")
  }
}

const getConnectionAlarmName = (host: string) => {
  return `alph:connection:${host}`
}

const connectionExpiryListner = (alarm: browser.alarms.Alarm) => {
  if (alarm.name.startsWith('alph:connection:')) {
    const host = alarm.name.split(':')[2]
    removePreAuthorization(host)
  }
}

export const setConnectionExpiryAlarm = async (host: string) => {
  if (!browser.alarms.onAlarm.hasListener(connectionExpiryListner)) {
    browser.alarms.onAlarm.addListener(connectionExpiryListner)
  }

  const alarmName = getConnectionAlarmName(host)
  await browser.alarms.clear(alarmName)
  browser.alarms.create(alarmName, {
    delayInMinutes: CONNECTION_EXPIRY,
  })
}

export const preAuthorize = async (
  account: BaseWalletAccount,
  host: string,
) => {
  await preAuthorizeStore.push({
    account,
    host,
  })

  await setConnectionExpiryAlarm(host)
}

export const removePreAuthorization = async (
  host: string,
  account?: BaseWalletAccount,
) => {
  await preAuthorizeStore.remove((x) => {
    if (account) {
      return equalPreAuthorization(x, { account, host })
    }
    return x.host === host
  })
  await browser.alarms.clear(getConnectionAlarmName(host))
}

export const getPreAuthorizations = () => {
  return preAuthorizeStore.get()
}

export const getPreAuthorized = async (options: { host: string, networkId?: string, group?: number, keyType?: KeyType }) => {
  const hits = await preAuthorizeStore.get((x) =>
    matchAuthorizedOptions(x, { ...options, addressGroup: options.group })
  )
  return hits.length === 0 ? undefined : hits[0]
}

function matchAuthorizedOptions(account: PreAuthorization, options: RequestOptions): boolean {
  return account.host === options.host &&
  (options.networkId === undefined || account.account.networkId === options.networkId) &&
  (options.address === undefined || account.account.address === options.address) &&
  (options.addressGroup === undefined || groupOfAddress(account.account.address) === options.addressGroup)
}

export const isPreAuthorized = async (
  options: RequestOptions,
) => {
  const hits = await preAuthorizeStore.get((x) =>
    matchAuthorizedOptions(x, options),
  )
  return Boolean(hits.length)
}

export async function resetPreAuthorizations() {
  await preAuthorizeStore.remove(() => true)
}

// Hooks

export const usePreAuthorizations = () => useArrayStorage(preAuthorizeStore)
export const useIsPreauthorized = (
  host: string,
  account?: BaseWalletAccount,
) => {
  const all = useArrayStorage(preAuthorizeStore)
  return all.some((x) => account && equalPreAuthorization(x, { account, host }))
}
