import browser from "webextension-polyfill"

import { accountStore, getAccounts } from "../shared/account/store"
import { globalActionQueueStore } from "../shared/actionQueue/store"
import { ActionItem } from "../shared/actionQueue/types"
import { MessageType, messageStream } from "../shared/messages"
import { getNetwork } from "../shared/network"
import { migratePreAuthorizations } from "../shared/preAuthorizations"
import { updateTokenList } from "../shared/token/storage"
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
import { setTokenListUpdateAlarm, setTransactionTrackerHistoryAlarm, tokenListUpdateAlarm, transactionTrackerHistoryAlarm } from "./alarms"
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
import { transactionWatcher } from "./transactions/transactionWatcher"
import { Wallet, sessionStore } from "./wallet"

setTransactionTrackerHistoryAlarm()
transactionWatcher.start()
setTokenListUpdateAlarm()

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === transactionTrackerHistoryAlarm) {
    console.info("~> fetching transaction history")
    await transactionTracker.loadHistory(await getAccounts())
  }

  if (alarm.name === tokenListUpdateAlarm) {
    console.info("~> update token list")
    await updateTokenList()
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
  "ALPH_IS_PREAUTHORIZED",
  "ALPH_REMOVE_PREAUTHORIZATION",
  "ALPH_CONNECT_DAPP",
  "DISCONNECT_ACCOUNT",
  "ALPH_EXECUTE_TRANSACTION",
  "ALPH_OPEN_UI",
  "ALPH_SIGN_MESSAGE",
  "ALPH_SIGN_UNSIGNED_TX",
  "REQUEST_ADD_TOKEN",
  "REQUEST_ADD_CUSTOM_NETWORK",
  "REQUEST_SWITCH_CUSTOM_NETWORK",
  "REQUEST_DECLARE_CONTRACT",
  // answers
  "ALPH_EXECUTE_TRANSACTION_RES",
  "ALPH_TRANSACTION_SUBMITTED",
  "ALPH_TRANSACTION_FAILED",
  "ALPH_SIGN_MESSAGE_RES",
  "ALPH_SIGN_MESSAGE_SUCCESS",
  "ALPH_SIGN_MESSAGE_FAILURE",
  "ALPH_SIGN_UNSIGNED_TX_RES",
  "ALPH_SIGN_UNSIGNED_TX_SUCCESS",
  "ALPH_SIGN_UNSIGNED_TX_FAILURE",
  "ALPH_IS_PREAUTHORIZED_RES",
  "ALPH_REMOVE_PREAUTHORIZATION_RES",
  "REQUEST_ADD_TOKEN_RES",
  "APPROVE_REQUEST_ADD_TOKEN",
  "REJECT_REQUEST_ADD_TOKEN",
  "REQUEST_ADD_CUSTOM_NETWORK_RES",
  "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
  "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
  "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
  "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
  "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
  "ALPH_CONNECT_DAPP_RES",
  "CONNECT_ACCOUNT_RES",
  "CONNECT_ACCOUNT",
  "ALPH_REJECT_PREAUTHORIZATION",
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
