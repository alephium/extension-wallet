export type AccountChangeEventHandler = (accounts: string[]) => void

export type NetworkChangeEventHandler = (network?: string) => void

export type WalletEventHandlers =
  | AccountChangeEventHandler
  | NetworkChangeEventHandler

export type WalletEvents =
  | {
      type: "accountsChanged"
      handler: AccountChangeEventHandler
    }
  | {
      type: "networkChanged"
      handler: NetworkChangeEventHandler
    }

interface IAlephiumWindowObject {
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
  chainId?: string
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
