import browser from "webextension-polyfill"

// For Chrome, the minimum effective delayInMinutes and periodInMinutes is 1 minute
// Reference: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/alarms/create#parameters

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
export function setTransactionTrackerUpdateAlarm() {
  browser.alarms.create(transactionTrackerUpdateAlarm, {
    delayInMinutes: 1,
    periodInMinutes: 1
  })
}

export const tokenListUpdateAlarm = "core:tokenList:update"
export async function refreshTokenListUpdateAlarm() {
  await browser.alarms.clear(tokenListUpdateAlarm)
  setTokenListUpdateAlarm()
}
export function setTokenListUpdateAlarm() {
  browser.alarms.create(tokenListUpdateAlarm, {
    delayInMinutes: 1,
    periodInMinutes: 60 // fetch token list updates every hour
  })
}
