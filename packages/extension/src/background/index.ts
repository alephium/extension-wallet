import browser from "webextension-polyfill"

import { accountStore, getAccounts } from "../shared/account/store"
import { globalActionQueueStore } from "../shared/actionQueue/store"
import { ActionItem } from "../shared/actionQueue/types"
import { MessageType, messageStream } from "../shared/messages"
import { getNetwork } from "../shared/network"
import { migratePreAuthorizations } from "../shared/preAuthorizations"
import { fetchTokenList } from "../shared/token/storage"
import { delay } from "../shared/utils/delay"
import { migrateWallet } from "../shared/wallet/storeMigration"
import { walletStore } from "../shared/wallet/walletStore"
import { handleAccountMessage } from "./accountMessaging"
import { handleActionMessage } from "./actionMessaging"
import { getQueue } from "./actionQueue"
import {
  hasTab,
  sendMessageToActiveTabs,
  sendMessageToActiveTabsAndUi,
  sendMessageToUi,
} from "./activeTabs"
import { setTransactionTrackerHistoryAlarm, setTransactionTrackerUpdateAlarm, tokenListUpdateAlarm, transactionTrackerHistoryAlarm, transactionTrackerUpdateAlarm } from "./alarms"
import {
  BackgroundService,
  HandleMessage,
  UnhandledMessage,
} from "./background"
import { getMessagingKeys } from "./keys/messagingKeys"
import { handleMiscellaneousMessage } from "./miscellaneousMessaging"
import { handleNetworkMessage } from "./networkMessaging"
import { initOnboarding } from "./onboarding"
import { handlePreAuthorizationMessage } from "./preAuthorizationMessaging"
import { handleRecoveryMessage } from "./recoveryMessaging"
import { handleSessionMessage } from "./sessionMessaging"
import { handleTokenMessaging } from "./tokenMessaging"
import { initBadgeText } from "./transactions/badgeText"
import { transactionTracker } from "./transactions/tracking"
import { handleTransactionMessage } from "./transactions/transactionMessaging"
import { Wallet, sessionStore } from "./wallet"

setTransactionTrackerHistoryAlarm()
setTransactionTrackerUpdateAlarm()
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === transactionTrackerHistoryAlarm) {
    console.info("~> fetching transaction history")
    await transactionTracker.loadHistory(await getAccounts())
  }

  if (alarm.name === transactionTrackerUpdateAlarm) {
    console.info("~> fetching transaction updates")
    let hasInFlightTransactions = await transactionTracker.update()

    // the config below will run transaction updates 7x per minute, if there are in-flight transactions
    // it will update on second 0, 15, 30 and 45
    const maxRetries = 6 // max 3 retries
    const waitTimeInS = 7.5 // wait 7.5 seconds between retries

    let runs = 0
    while (hasInFlightTransactions && runs < maxRetries) {
      console.info(`~> waiting ${waitTimeInS}s for transaction updates`)
      await delay(waitTimeInS * 1000)
      console.info(
        "~> fetching transaction updates as pending transactions were detected",
      )
      runs++
      hasInFlightTransactions = await transactionTracker.update()
    }
  }

  if (alarm.name === tokenListUpdateAlarm) {
    console.info("~> fetching token list")
    await fetchTokenList()
  }
})

// badge shown on extension icon

initBadgeText()

// runs on startup

const handlers = [
  handleAccountMessage,
  handleActionMessage,
  handleMiscellaneousMessage,
  handleNetworkMessage,
  handlePreAuthorizationMessage,
  handleRecoveryMessage,
  handleSessionMessage,
  handleTransactionMessage,
  handleTokenMessaging
] as Array<HandleMessage<MessageType>>

getAccounts()
  .then((x) => transactionTracker.loadHistory(x))
  .catch(() => console.warn("failed to load transaction history"))

const safeMessages: MessageType["type"][] = [
  "IS_PREAUTHORIZED",
  "REMOVE_PREAUTHORIZATION",
  "ALPH_CONNECT_DAPP",
  "DISCONNECT_ACCOUNT",
  "ALPH_EXECUTE_TRANSACTION",
  "ALPH_OPEN_UI",
  "ALPH_SIGN_MESSAGE",
  "REQUEST_ADD_TOKEN",
  "REQUEST_ADD_CUSTOM_NETWORK",
  "REQUEST_SWITCH_CUSTOM_NETWORK",
  "REQUEST_DECLARE_CONTRACT",
  // answers
  "ALPH_EXECUTE_TRANSACTION_RES",
  "TRANSACTION_SUBMITTED",
  "TRANSACTION_FAILED",
  "ALPH_SIGN_MESSAGE_RES",
  "SIGNATURE_SUCCESS",
  "SIGNATURE_FAILURE",
  "IS_PREAUTHORIZED_RES",
  "REMOVE_PREAUTHORIZATION_RES",
  "REQUEST_ADD_TOKEN_RES",
  "APPROVE_REQUEST_ADD_TOKEN",
  "REJECT_REQUEST_ADD_TOKEN",
  "REQUEST_ADD_CUSTOM_NETWORK_RES",
  "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
  "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
  "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
  "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
  "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
  "CONNECT_DAPP_RES",
  "CONNECT_ACCOUNT_RES",
  "CONNECT_ACCOUNT",
  "REJECT_PREAUTHORIZATION",
  "REQUEST_DECLARE_CONTRACT_RES",
  "DECLARE_CONTRACT_ACTION_FAILED",
  "DECLARE_CONTRACT_ACTION_SUBMITTED",
]

messageStream.subscribe(async ([msg, sender]) => {
  await Promise.all([migrateWallet(), migratePreAuthorizations()]) // do migrations before handling messages

  const messagingKeys = await getMessagingKeys()

  const wallet = new Wallet(
    walletStore,
    accountStore,
    sessionStore,
    getNetwork,
  )

  const actionQueue = await getQueue<ActionItem>(globalActionQueueStore)

  const background: BackgroundService = {
    wallet,
    transactionTracker,
    actionQueue,
  }

  const extensionUrl = browser.runtime.getURL("")
  const safeOrigin = extensionUrl.replace(/\/$/, "")
  const origin = sender.origin ?? sender.url // Firefox uses url, Chrome uses origin
  const isSafeOrigin = Boolean(origin?.startsWith(safeOrigin))

  if (!isSafeOrigin && !safeMessages.includes(msg.type)) {
    console.warn(
      "message received from unknown origin is trying to use unsafe method",
    )
    return // this return must not be removed
  }

  // forward UI messages to rest of the tabs
  if (isSafeOrigin && (await hasTab(sender.tab?.id))) {
    await sendMessageToActiveTabs(msg)
  }

  const respond = async (msg: MessageType) => {
    console.log("respond", msg)
    if (safeMessages.includes(msg.type)) {
      await sendMessageToActiveTabsAndUi(msg, [sender.tab?.id])
    } else {
      await sendMessageToUi(msg)
    }
  }

  for (const handleMessage of handlers) {
    try {
      await handleMessage({
        msg,
        sender,
        background,
        messagingKeys,
        respond,
      })
    } catch (error) {
      if (error instanceof UnhandledMessage) {
        continue
      }
      throw error
    }
    break
  }
})

// open onboarding flow on initial install

initOnboarding()
