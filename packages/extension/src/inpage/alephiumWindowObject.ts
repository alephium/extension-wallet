import {
  Address,
  ExplorerProvider,
  groupOfAddress,
  NodeProvider,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from '@alephium/web3'

import { WindowMessageType } from '../shared/messages'
import { Network, defaultNetworks } from '../shared/networks'
import { TransactionPayload, TransactionResult } from '../shared/transactions'
import { assertNever } from '../ui/services/assertNever'
import { alephiumIcon } from './icon'
import {
  AccountChangeEventHandler,
  AlephiumWindowObject,
  NetworkChangeEventHandler,
  WalletEvents,
  EnableOptions
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

export const alephiumWindowObject: AlephiumWindowObject = new (class implements AlephiumWindowObject {
  id = 'alephium' as const
  name = 'Alephium' as const
  icon = alephiumIcon
  defaultAddress = undefined
  currentNetwork = undefined as string | undefined
  isConnected = false
  disconnect = () => Promise.resolve() // TODO: FIXME
  enable = (_options?: EnableOptions): Promise<void> =>
    new Promise((resolve) => {
      const handleMessage = ({ data }: MessageEvent<WindowMessageType>) => {
        const { alephiumProviders } = window
        const alephium = alephiumProviders?.alephium
        if (!alephium) {
          return
        }

        if ((data.type === 'CONNECT_DAPP_RES' && data.data) || (data.type === 'START_SESSION_RES' && data.data)) {
          window.removeEventListener('message', handleMessage)
          const { address, publicKey } = data.data
          alephium.defaultAddress = {
            address,
            publicKey,
            group: groupOfAddress(address)
          }
          alephium.on('addressesChanged', (addresses: string[]) => {
            if (addresses.length === 0) {
              _options?.onDisconnected()
            }
          })

          alephium.on('networkChanged', (network: Network) => {
            _options?.onNetworkChanged({
              networkId: defaultNetworks.findIndex((item) => item.name === network.name),
              networkName: network.name
            })
            this.currentNetwork = network.name
          })

          alephium.isConnected = true
          resolve()
        }
      }
      window.addEventListener('message', handleMessage)

      sendMessage({
        type: 'CONNECT_DAPP',
        data: { host: window.location.host, group: _options?.chainGroup }
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
      throw new Error(`Unknown event: ${event}`)
    }

    const eventIndex = userEventHandlers.findIndex(
      (userEvent) => userEvent.type === event && userEvent.handler === handleEvent
    )

    if (eventIndex >= 0) {
      userEventHandlers.splice(eventIndex, 1)
    }
  }

  getSelectedAddress = async (): Promise<Address> => {
    const { alephiumProviders } = window
    const alephium = alephiumProviders?.alephium

    if (alephium?.defaultAddress) {
      return Promise.resolve(alephium.defaultAddress.address)
    } else {
      throw new Error('no selected account')
    }
  }

  signAndSubmitTransferTx = async (params: SignTransferTxParams): Promise<SignTransferTxResult> => {
    return (
      await executeAlephiumTransaction({
        type: 'ALPH_SIGN_AND_SUBMIT_TRANSFER_TX',
        params
      })
    ).result as SignTransferTxResult
  }

  signAndSubmitDeployContractTx = async (params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> => {
    return (
      await executeAlephiumTransaction({
        type: 'ALPH_SIGN_AND_SUBMIT_DEPLOY_CONTRACT_TX',
        params
      })
    ).result as SignDeployContractTxResult
  }

  signAndSubmitExecuteScriptTx = async (params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_AND_SUBMIT_EXECUTE_SCRIPT_TX', params }))
      .result as SignExecuteScriptTxResult
  }

  signUnsignedTx = async (params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_UNSIGNED_TX', params })).result as SignUnsignedTxResult
  }

  signAndSubmitUnsignedTx = async (params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_AND_SUBMIT_UNSIGNED_TX', params })).result as SignUnsignedTxResult
  }

  signMessage = async (params: SignMessageParams): Promise<SignMessageResult> => {
    return (await executeAlephiumTransaction({ type: 'ALPH_SIGN_MESSAGE', params })).result as SignMessageResult
  }

  nodeProvider = NodeProvider.Proxy(new NodeProvider(defaultNetworks[0].nodeUrl))
  explorerProvider = ExplorerProvider.Proxy(new ExplorerProvider(defaultNetworks[0].explorerApiUrl))

  updateProviders: NetworkChangeEventHandler = (network: Network) => {
    this.nodeProvider = NodeProvider.Proxy(new NodeProvider(network.nodeUrl))
    this.explorerProvider = ExplorerProvider.Proxy(new ExplorerProvider(network.explorerApiUrl))
  }
})()

alephiumWindowObject.on('networkChanged', alephiumWindowObject.updateProviders)
