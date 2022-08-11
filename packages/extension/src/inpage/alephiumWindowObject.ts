import {
  Account,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignHexStringParams,
  SignHexStringResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult,
} from "@alephium/web3"

import { assertNever } from "./../ui/services/assertNever"
import { WindowMessageType } from "../shared/messages"
import {
  AccountChangeEventHandler,
  AlephiumWindowObject,
  NetworkChangeEventHandler,
  WalletEvents,
} from "./inpage.model"
import { sendMessage, waitForMessage } from "./messageActions"
import { groupOfAddress } from "@alephium/sdk"
import { TransactionPayload, TransactionResult } from "../shared/transactions"

export const userEventHandlers: WalletEvents[] = []

export const executeAlephiumTransaction = async (
  data: TransactionPayload,
): Promise<TransactionResult> => {
  sendMessage({ type: "EXECUTE_TRANSACTION", data })
  const { actionHash } = await waitForMessage("EXECUTE_TRANSACTION_RES", 1000)
  const { txResult } = await waitForMessage(
    "TRANSACTION_RES",
    10000, // 2 minute, probably long enough to approve or reject the transaction
    ({ data }) => data.actionHash === actionHash,
  )
  return txResult
}

export const alephiumWindowObject: AlephiumWindowObject = {
  id: "alephium",
  selectedAddress: undefined,
  isConnected: false,
  enable: () =>
    new Promise((resolve) => {
      const handleMessage = ({ data }: MessageEvent<WindowMessageType>) => {
        const { alephium } = window
        if (!alephium) {
          return
        }

        if (
          (data.type === "CONNECT_DAPP_RES" && data.data) ||
          (data.type === "START_SESSION_RES" && data.data)
        ) {
          window.removeEventListener("message", handleMessage)
          const { address } = data.data
          alephium.selectedAddress = address
          alephium.isConnected = true
          resolve([address])
        }
      }
      window.addEventListener("message", handleMessage)

      sendMessage({
        type: "CONNECT_DAPP",
        data: { host: window.location.host },
      })
    }),
  isPreauthorized: async () => {
    sendMessage({
      type: "IS_PREAUTHORIZED",
      data: window.location.host,
    })
    return waitForMessage("IS_PREAUTHORIZED_RES", 1000)
  },
  // sign different kinda messages
  on: (event, handleEvent) => {
    if (event === "addressesChanged") {
      userEventHandlers.push({
        type: event,
        handler: handleEvent as AccountChangeEventHandler,
      })
    } else if (event === "networkChanged") {
      userEventHandlers.push({
        type: event,
        handler: handleEvent as NetworkChangeEventHandler,
      })
    } else {
      assertNever(event)
      throw new Error(`Unknwown event: ${event}`)
    }
  },
  off: (event, handleEvent) => {
    if (event !== "addressesChanged" && event !== "networkChanged") {
      assertNever(event)
      throw new Error(`Unknwown event: ${event}`)
    }

    const eventIndex = userEventHandlers.findIndex(
      (userEvent) =>
        userEvent.type === event && userEvent.handler === handleEvent,
    )

    if (eventIndex >= 0) {
      userEventHandlers.splice(eventIndex, 1)
    }
  },

  getAccounts: async (): Promise<Account[]> => {
    sendMessage({ type: "GET_ADDRESSES" })
    const addresses = await waitForMessage("GET_ADDRESSES_RES", 100)
    return addresses.map((addr) => {
      const group = groupOfAddress(addr.address)
      return {
        address: addr.address,
        group,
        publicKey: addr.publicKey,
      }
    })
  },
  signTransferTx: async (
    params: SignTransferTxParams,
  ): Promise<SignTransferTxResult> => {
    return (
      await executeAlephiumTransaction({
        type: "ALPH_SIGN_TRANSFER_TX",
        params,
      })
    ).result
  },
  signDeployContractTx: async (
    params: SignDeployContractTxParams,
  ): Promise<SignDeployContractTxResult> => {
    return (
      await executeAlephiumTransaction({
        type: "ALPH_SIGN_CONTRACT_CREATION_TX",
        params,
      })
    ).result as SignDeployContractTxResult
  },
  signExecuteScriptTx: async (
    params: SignExecuteScriptTxParams,
  ): Promise<SignExecuteScriptTxResult> => {
    return (
      await executeAlephiumTransaction({ type: "ALPH_SIGN_SCRIPT_TX", params })
    ).result
  },
  signUnsignedTx: async (
    params: SignUnsignedTxParams,
  ): Promise<SignUnsignedTxResult> => {
    throw Error(`signUnsignedTx unsupported ${params}`)
  },
  signHexString: async (
    params: SignHexStringParams,
  ): Promise<SignHexStringResult> => {
    throw Error(`signHexString unsupported ${params}`)
  },
  signMessage: async (
    params: SignMessageParams,
  ): Promise<SignMessageResult> => {
    throw Error(`signMessage unsupported ${params}`)
  },
}
