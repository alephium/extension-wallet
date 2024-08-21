import browser from "webextension-polyfill"
import { getAccountSelector, withoutHiddenSelector } from "../shared/account/selectors"

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
import { setTokenListUpdateAlarm, setTransactionTrackerHistoryAlarm, setTransactionTrackerUpdateAlarm, tokenListUpdateAlarm, transactionTrackerHistoryAlarm, transactionTrackerUpdateAlarm } from "./alarms"
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
setTokenListUpdateAlarm()

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === transactionTrackerHistoryAlarm) {
    console.info("~> fetching transaction history")
    const selectedAccount = await walletStore.get("selected")
    const accountSelector = selectedAccount ? getAccountSelector(selectedAccount) : withoutHiddenSelector
    await transactionTracker.loadHistory(await getAccounts(accountSelector))
  }

  if (alarm.name === transactionTrackerUpdateAlarm) {
    console.info("~> fetching transaction updates")
    await transactionTracker.update()
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
  .then((x) => (async () => {
    await transactionTracker.prune()
    await transactionTracker.loadHistory(x)
  })())
  .catch((e) => console.warn("failed to prune and load latest transactions", e))

const safeMessages: MessageType["type"][] = [
  "ALPH_IS_PREAUTHORIZED",
  "ALPH_REMOVE_PREAUTHORIZATION",
  "ALPH_CONNECT_DAPP",
  "ALPH_DISCONNECT_ACCOUNT",
  "ALPH_EXECUTE_TRANSACTION",
  "ALPH_OPEN_UI",
  "ALPH_SIGN_MESSAGE",
  "ALPH_SIGN_UNSIGNED_TX",
  "ALPH_REQUEST_ADD_TOKEN",
  "ALPH_REQUEST_ADD_CUSTOM_NETWORK",
  "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK",
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
  "ALPH_REQUEST_ADD_TOKEN_RES",
  "ALPH_APPROVE_REQUEST_ADD_TOKEN",
  "ALPH_REJECT_REQUEST_ADD_TOKEN",
  "ALPH_REQUEST_ADD_CUSTOM_NETWORK_RES",
  "ALPH_APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
  "ALPH_REJECT_REQUEST_ADD_CUSTOM_NETWORK",
  "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK_RES",
  "ALPH_APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
  "ALPH_REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
  "ALPH_CONNECT_DAPP_RES",
  "ALPH_CONNECT_ACCOUNT_RES",
  "ALPH_CONNECT_ACCOUNT",
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
