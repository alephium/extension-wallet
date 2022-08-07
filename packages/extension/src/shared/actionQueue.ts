import { SignTransferTxParams } from "@alephium/web3"

import type { ExtQueueItem as ExtensionQueueItem } from "../background/actionQueue"

export type AlephiumTransactionPayload = {
  type: "ALPH_SIGN_TRANSFER_TX"
  params: SignTransferTxParams
}

export type ActionItem =
  | {
      type: "CONNECT_DAPP"
      payload: {
        host: string
      }
    }
  | {
      type: "TRANSACTION"
      payload: AlephiumTransactionPayload
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
