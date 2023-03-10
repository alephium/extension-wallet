import { Address, Number256, Token as Web3Token } from "@alephium/web3"
import { KnownDapp } from "../../../../shared/knownDapps"
import { Token } from "../../../../shared/token/type"

export type TransformedTransactionAction =
  | "UNKNOWN"
  | "CREATE"
  | "UPGRADE"
  | "MINT"
  | "TRANSFER"
  | "SEND"
  | "RECEIVE"
  | "MOVE"
  | "SWAP"
  | "BUY"
  | "APPROVE"
  | "DECLARE"
  | "DEPLOY"

export type TransformedTransactionEntity =
  | "UNKNOWN"
  | "ACCOUNT"
  | "DAPP"
  | "TOKEN"
  | "ALPH"
  | "NFT"
  | "CONTRACT"

export interface BaseTransformedTransaction {
  action: TransformedTransactionAction
  entity: TransformedTransactionEntity
  date?: string
  displayName?: string
  maxFee?: string
  actualFee?: string
  dappContractAddress?: string
  dapp?: Omit<KnownDapp, "contracts">
}

export interface AlphTransferTransaction extends BaseTransformedTransaction {
  action: "MOVE" | "SEND" | "RECEIVE"
  entity: "ALPH"
  amount: string
  fromAddress?: string
  toAddress?: string
}

export interface TokenTransferTransaction extends BaseTransformedTransaction {
  action: "TRANSFER" | "SEND" | "RECEIVE"
  entity: "TOKEN"
  amount: string
  fromAddress: string
  toAddress: string
  tokenAddress: string
  token: Token
}

export interface TokenApproveTransaction extends BaseTransformedTransaction {
  action: "APPROVE"
  entity: "TOKEN"
  amount: string
  spenderAddress: string
  tokenAddress: string
  token: Token
}

export interface TokenMintTransaction extends BaseTransformedTransaction {
  action: "MINT"
  entity: "TOKEN"
  amount: string
  toAddress: string
  tokenAddress: string
  token: Token
}

export interface NFTTransaction extends BaseTransformedTransaction {
  entity: "NFT"
  contractAddress: string
  tokenId: string
}

export interface NFTTransferTransaction extends NFTTransaction {
  action: "TRANSFER" | "SEND" | "RECEIVE"
  fromAddress: string
  toAddress: string
}

export interface SwapTransaction extends BaseTransformedTransaction {
  action: "SWAP"
  contractAddress: string
  dappContractAddress?: string
  dapp: Omit<KnownDapp, "contracts">
  fromTokenAddress: string
  toTokenAddress: string
  fromAmount: string
  toAmount: string
  fromToken: Token
  toToken: Token
}

export interface DeclareContractTransaction extends BaseTransformedTransaction {
  action: "DECLARE"
  entity: "CONTRACT"
  classHash: string
}

export interface DeployContractTransaction extends BaseTransformedTransaction {
  action: "DEPLOY"
  entity: "CONTRACT"
  contractAddress: string
}

export type TransformedTransaction =
  | BaseTransformedTransaction
  | TokenTransferTransaction
  | TokenApproveTransaction
  | TokenMintTransaction
  | NFTTransaction
  | NFTTransferTransaction
  | SwapTransaction
  | DeclareContractTransaction
  | DeployContractTransaction

export interface DestinationAddress {
  address: Address
  type: 'From' | 'To' | 'From/To'
}

export interface AmountChanges {
  attoAlphAmount: bigint
  tokens: Record<string, bigint> // (id, amount) pair
}

export interface TransferTransformedAlephiumTransaction {
  type: 'TRANSFER'
  transferType: 'Send' | 'Receive' | 'Exchange'
  destinations: DestinationAddress[]
  amountChanges: AmountChanges
}

export interface DeployContractTransformedAlephiumTransaction {
  type: 'DEPLOY_CONTRACT'
  contractAddress: string
  contractId: string
  issueTokenAmount?: Number256
}

export interface ExecuteScriptTransformedAlephiumTransaction {
  type: "EXECUTE_SCRIPT"
  bytecode: string
  host?: string
  attoAlphAmount?: Number256
  tokens?: Web3Token[]
}

export interface UnsignedTxTransformedAlephiumTransaction {
  type: "UNSIGNED_TX"
  unsignedTx: string
}

export type TransformedAlephiumTransaction =
  | TransferTransformedAlephiumTransaction
  | DeployContractTransformedAlephiumTransaction
  | ExecuteScriptTransformedAlephiumTransaction
  | UnsignedTxTransformedAlephiumTransaction
