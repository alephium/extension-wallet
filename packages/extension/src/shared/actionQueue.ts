import type { ExtQueueItem as ExtensionQueueItem } from "../background/actionQueue"
import { TransactionPayload } from "../shared/transactions"

export type ActionItem =
  | {
      type: "CONNECT_DAPP"
      payload: {
        host: string
      }
    }
  | {
      type: "TRANSACTION"
      payload: TransactionPayload
    }
  | {
      type: "REQUEST_ADD_CUSTOM_NETWORK"
      payload: {
        id: string
        name: string
        nodeUrl: string
        explorerUrl?: string
        explorerApiUrl: string
      }
    }
  | {
      type: "REQUEST_SWITCH_CUSTOM_NETWORK"
      payload: {
        id: string
        name: string
        nodeUrl: string
        explorerUrl?: string
        explorerApiUrl: string
      }
    }

export type ExtensionActionItem = ExtensionQueueItem<ActionItem>
