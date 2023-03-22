import browser from "webextension-polyfill"

const transactionTrackerHistoryAlarm = "core:transactionTracker:history"
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

const transactionTrackerUpdateAlarm = "core:transactionTracker:update"
export async function refreshTransactionTrackerUpdate() {
  await browser.alarms.clear(transactionTrackerUpdateAlarm)
  setTransactionTrackerUpdateAlarm()
}
export function setTransactionTrackerUpdateAlarm() {
  browser.alarms.create(transactionTrackerUpdateAlarm, {
    delayInMinutes: 0.05,
    periodInMinutes: 0.5, // fetch transaction updates of existing transactions every half minute from onchain
  })
}
