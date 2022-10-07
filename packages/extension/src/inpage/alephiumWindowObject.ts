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

import { assertNever } from "../ui/services/assertNever"
import { WindowMessageType } from "../shared/messages"
import {
  AccountChangeEventHandler,
  AlephiumWindowObject,
  NetworkChangeEventHandler,
  WalletEvents,
} from "./inpage.model"
import { sendMessage, waitForMessage, waitForMessages } from "./messageActions"
import { groupOfAddress } from "@alephium/sdk"
import { TransactionPayload, TransactionResult } from "../shared/transactions"
import { defaultNetworks } from "../shared/networks"
import { alephiumIcon } from "./icon"

export const userEventHandlers: WalletEvents[] = []

export const executeAlephiumTransaction = async (
  data: TransactionPayload,
): Promise<TransactionResult> => {
  sendMessage({ type: "EXECUTE_TRANSACTION", data })
  const { actionHash } = await waitForMessage("EXECUTE_TRANSACTION_RES", 1000)
  const result = await waitForMessages(
    ["TRANSACTION_SUCCESS", "TRANSACTION_FAILED", "TRANSACTION_REJECTED"],
    300000, // TODO: Fix timeout
    ({ data }) => data.actionHash === actionHash,
  )

  switch (result.tag) {
    case "Rejected": {
      throw new Error(`Transaction rejected by user`)
    }

    case "Failure": {
      throw new Error(`Transaction failed: ${result.error}`)
    }

    case "Success": {
      return result.txResult
    }
  }
}

export const alephiumWindowObject: AlephiumWindowObject = {
  id: "alephium",
  name: "Alephium",
  icon: alephiumIcon,
  selectedAccount: undefined,
  currentNetwork: defaultNetworks[0].id,
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
          const { address, publicKey, addressIndex } = data.data
          alephium.selectedAccount = {
            address,
            publicKey,
            group: addressIndex
          }
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
  getSelectedAccount: async (): Promise<Account> => {
    const { alephium } = window
    if (alephium?.selectedAccount) {
      return Promise.resolve(alephium.selectedAccount)
    } else {
      throw new Error("no selected account")
    }
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
  }
}
