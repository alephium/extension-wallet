import browser from "webextension-polyfill"

export const transactionTrackerHistoryAlarm = "core:transactionTracker:history"
export async function refreshTransactionTrackerHistoryAlarm() {
  await browser.alarms.clear(transactionTrackerHistoryAlarm)
  setTransactionTrackerHistoryAlarm()
}
export function setTransactionTrackerHistoryAlarm() {
  browser.alarms.clear(transactionTrackerHistoryAlarm)
  browser.alarms.create(transactionTrackerHistoryAlarm, {
    periodInMinutes: 5, // fetch history transactions every 5 minutes from voyager
  })
}

export const transactionTrackerUpdateAlarm = "core:transactionTracker:update"
export async function refreshTransactionTrackerUpdateAlarm() {
  await browser.alarms.clear(transactionTrackerUpdateAlarm)
  setTransactionTrackerUpdateAlarm()
}
export function setTransactionTrackerUpdateAlarm() {
  browser.alarms.create(transactionTrackerUpdateAlarm, {
    delayInMinutes: 0.05,
    periodInMinutes: 0.5, // fetch transaction updates of existing transactions every half minute from onchain
  })
}


export const tokenListUpdateAlarm = "core:tokenList:update"
export async function refreshTokenListUpdateAlarm() {
  await browser.alarms.clear(tokenListUpdateAlarm)
  setTokenListUpdateAlarm()
}
export function setTokenListUpdateAlarm() {
  browser.alarms.create(tokenListUpdateAlarm, {
    delayInMinutes: 0.02,
    periodInMinutes: 60, // fetch token list updates every hour
  })
}
