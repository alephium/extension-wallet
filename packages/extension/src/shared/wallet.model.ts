import { KeyType } from "@alephium/web3"
import { getNetwork, Network } from "./network"

export type AlephiumAccountType = "alephium" | "gl-secp256k1"  // TODO: create better account types
export type SignerType = "local_secret" | "ledger"
export interface WalletAccountSigner {
  type: SignerType
  keyType: KeyType
  publicKey: string
  derivationIndex: number
  group: number
}

export interface WithSigner {
  signer: WalletAccountSigner
}

export interface BaseWalletAccount {
  address: string
  networkId: string
}

export interface WalletAccount extends BaseWalletAccount, WithSigner {
  type: AlephiumAccountType
  hidden?: boolean
}

export type WalletAccountWithNetwork = Omit<WalletAccount, 'networkId'> & { network: Network }

export type StoredWalletAccount = Omit<WalletAccount, "network">
