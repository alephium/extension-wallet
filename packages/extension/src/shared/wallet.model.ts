import { Network } from "./network"

export type ArgentAccountType = "argent" | "argent-plugin"
export interface WalletAccountSigner {
  type: "local_secret"
  publicKey: string
  derivationIndex: number
}

export interface WithSigner {
  signer: WalletAccountSigner
}

export interface BaseWalletAccount {
  address: string
  networkId: string
}

export interface WalletAccount extends BaseWalletAccount, WithSigner {
  type: ArgentAccountType
  hidden?: boolean
}

export type StoredWalletAccount = Omit<WalletAccount, "network">
