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
  SignerProvider,
} from "@alephium/web3"

export type AccountChangeEventHandler = (accounts: string[]) => void

export type NetworkChangeEventHandler = (network?: string) => void

export type WalletEventHandlers =
  | AccountChangeEventHandler
  | NetworkChangeEventHandler

export type WalletEvents =
  | {
    type: "addressesChanged"
    handler: AccountChangeEventHandler
  }
  | {
    type: "networkChanged"
    handler: NetworkChangeEventHandler
  }

declare class IAlephiumWindowObject implements SignerProvider {
  id: "alephium"
  enable: (options?: { showModal?: boolean }) => Promise<string[]>
  isPreauthorized: () => Promise<boolean>
  on: (
    event: WalletEvents["type"],
    handleEvent: WalletEvents["handler"],
  ) => void
  off: (
    event: WalletEvents["type"],
    handleEvent: WalletEvents["handler"],
  ) => void
  selectedAddress?: string
  getAccounts(): Promise<Account[]>
  signTransferTx(params: SignTransferTxParams): Promise<SignTransferTxResult>
  signDeployContractTx(
    params: SignDeployContractTxParams,
  ): Promise<SignDeployContractTxResult>
  signExecuteScriptTx(
    params: SignExecuteScriptTxParams,
  ): Promise<SignExecuteScriptTxResult>
  signUnsignedTx(params: SignUnsignedTxParams): Promise<SignUnsignedTxResult>
  signHexString(params: SignHexStringParams): Promise<SignHexStringResult>
  signMessage(params: SignMessageParams): Promise<SignMessageResult>
}

interface ConnectedAlephiumWindowObject extends IAlephiumWindowObject {
  isConnected: true
  selectedAddress: string
  chainId: string
}

interface DisconnectedAlephiumWindowObject extends IAlephiumWindowObject {
  isConnected: false
}

export type AlephiumWindowObject =
  | ConnectedAlephiumWindowObject
  | DisconnectedAlephiumWindowObject

declare global {
  interface Window {
    alephium?: AlephiumWindowObject
  }
}
