import {
  Account,
  NodeProvider,
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
  SubmissionResult
} from '@alephium/web3'
import { WindowMessageType } from '../shared/messages'
import { defaultNetworks, Network } from '../shared/networks'
import { TransactionPayload, TransactionResult } from '../shared/transactions'
import { assertNever } from '../ui/services/assertNever'
import { alephiumIcon } from './icon'
import {
  AccountChangeEventHandler,
  AlephiumWindowObject,
  NetworkChangeEventHandler,
  WalletEvents
} from './inpage.model'
import { sendMessage, waitForMessage, waitForMessages } from './messageActions'

export const userEventHandlers: WalletEvents[] = []

export const executeAlephiumTransaction = async (data: TransactionPayload): Promise<TransactionResult> => {
  sendMessage({ type: 'EXECUTE_TRANSACTION', data })
  const { actionHash } = await waitForMessage('EXECUTE_TRANSACTION_RES', 1000)
  const result = await waitForMessages(
    ['TRANSACTION_SUCCESS', 'TRANSACTION_FAILED', 'TRANSACTION_REJECTED'],
    300000, // TODO: Fix timeout
    ({ data }) => data.actionHash === actionHash
  )

  switch (result.tag) {
    case 'Rejected': {
      throw new Error(`Transaction rejected by user`)
    }

    case 'Failure': {
      throw new Error(`Transaction failed: ${result.error}`)
    }

    case 'Success': {
      return result.txResult
    }
  }
}

export const alephiumWindowObject: AlephiumWindowObject = new (class extends AlephiumWindowObject {
  id = 'alephium'
  name = 'Alephium'
  icon = alephiumIcon
  defaultAddress = undefined
  currentNetwork = defaultNetworks[0].id
  isConnected = false
  enable = (_options?: { showModal?: boolean }): Promise<string[]> =>
    new Promise((resolve) => {
      const handleMessage = ({ data }: MessageEvent<WindowMessageType>) => {
        const { alephium } = window
        if (!alephium) {
          return
        }

        if ((data.type === 'CONNECT_DAPP_RES' && data.data) || (data.type === 'START_SESSION_RES' && data.data)) {
          window.removeEventListener('message', handleMessage)
          const { address, publicKey, addressIndex } = data.data
          alephium.defaultAddress = {
            address,
            publicKey,
            group: addressIndex
          }
          alephium.isConnected = true
          resolve([address])
        }
      }
      window.addEventListener('message', handleMessage)

      sendMessage({
        type: 'CONNECT_DAPP',
        data: { host: window.location.host }
      })
    })

  isPreauthorized = async () => {
    sendMessage({
      type: 'IS_PREAUTHORIZED',
      data: window.location.host
    })
    return waitForMessage('IS_PREAUTHORIZED_RES', 1000)
  }

  // sign different kinda messages
  on = (event: WalletEvents['type'], handleEvent: WalletEvents['handler']) => {
    if (event === 'addressesChanged') {
      userEventHandlers.push({
        type: event,
        handler: handleEvent as AccountChangeEventHandler
      })
    } else if (event === 'networkChanged') {
      userEventHandlers.push({
        type: event,
        handler: handleEvent as NetworkChangeEventHandler
      })
    } else {
      assertNever(event)
      throw new Error(`Unknwown event: ${event}`)
    }
  }

  off = (event: WalletEvents['type'], handleEvent: WalletEvents['handler']) => {
    if (event !== 'addressesChanged' && event !== 'networkChanged') {
      assertNever(event)
      throw new Error(`Unknwown event: ${event}`)
    }

    const eventIndex = userEventHandlers.findIndex(
      (userEvent) => userEvent.type === event && userEvent.handler === handleEvent
    )

    if (eventIndex >= 0) {
      userEventHandlers.splice(eventIndex, 1)
    }
  }

  getSelectedAccount = async (): Promise<Account> => {
    const { alephium } = window
    if (alephium?.defaultAddress) {
      return Promise.resolve(alephium.defaultAddress)
    } else {
      throw new Error("no selected account")
    }
  }

  signTransferTx = async (params: SignTransferTxParams): Promise<SignTransferTxResult> => {
    return (
      await executeAlephiumTransaction({
        type: 'ALPH_SIGN_TRANSFER_TX',
        params
      })
    ).result as SignTransferTxResult
  }

  signAndSubmitTransferTx = async (params: SignTransferTxParams): Promise<SubmissionResult> => {
    return (
      await executeAlephiumTransaction({
        type: 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX',
        params
      })
    ).result as SubmissionResult
  }

  signDeployContractTx = async (params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> => {
    return (
      await executeAlephiumTransaction({
        type: 'ALPH_SIGN_CONTRACT_CREATION_TX',
        params
      })
    ).result as SignDeployContractTxResult
  }

  signAndSubmitDeployContractTx = async (params: SignDeployContractTxParams): Promise<SubmissionResult> => {
    return (
      await executeAlephiumTransaction({
        type: 'ALPH_SIGN_AND_SUBMIT_CONTRACT_CREATION_TX',
        params
      })
    ).result as SubmissionResult
  }

  signExecuteScriptTx = async (params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_SCRIPT_TX', params })).result as SignExecuteScriptTxResult
  }

  signAndSubmitExecuteScriptTx = async (params: SignExecuteScriptTxParams): Promise<SubmissionResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_AND_SUBMIT_SCRIPT_TX', params })).result as SubmissionResult
  }

  signUnsignedTx = async (params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_UNSIGNED_TX', params })).result as SignUnsignedTxResult
  }

  signHexString = async (params: SignHexStringParams): Promise<SignHexStringResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_HEX_STRING', params })).result as SignHexStringResult
  }

  signMessage = async (params: SignMessageParams): Promise<SignMessageResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_MESSAGE', params })).result as SignMessageResult
  }

  signRaw = async (signerAddress: string, hexString: string): Promise<string> => {
    throw Error(`signRaw unsupported signerAddress: ${signerAddress}, hexString: ${hexString}`)
  }

  nodeProvider = new NodeProvider(defaultNetworks[0].nodeUrl)

  updateNodeProvider: NetworkChangeEventHandler = (network: Network) => {
    this.nodeProvider = new NodeProvider(network.nodeUrl)
  }
})

alephiumWindowObject.on("networkChanged", alephiumWindowObject.updateNodeProvider)
