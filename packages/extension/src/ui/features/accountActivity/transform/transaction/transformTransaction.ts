import { Destination, number256ToBigint } from "@alephium/web3"
import { ReviewTransactionResult } from "../../../../../shared/actionQueue/types"
import { AlephiumExplorerTransaction } from "../../../../../shared/explorer/type"
import { Token } from "../../../../../shared/token/type"
import { Transaction } from "../../../../../shared/transactions"
import { ActivityTransaction } from "../../useActivity"
import { AmountChanges, DestinationAddress, TransformedAlephiumTransaction, TransformedTransaction } from "../type"
import dateTransformer from "./transformers/dateTransformer"
import defaultDisplayNameTransformer from "./transformers/defaultDisplayNameTransformer"
import knownDappTransformer from "./transformers/knownDappTransformer"
import nftTransferTransformer from "./transformers/nftTransferTransformer"
import postTransferTransformer from "./transformers/postTransferTransformer"
import tokenMintTransformer from "./transformers/tokenMintTransformer"
import tokenTransferTransformer from "./transformers/tokenTransferTransformer"

/** all are executed */
const preTransformers = [
  dateTransformer,
  defaultDisplayNameTransformer,
  knownDappTransformer,
]

/** all are executed until one returns */
const mainTransformers = [
  nftTransferTransformer,
  tokenMintTransformer,
  tokenTransferTransformer
]

/** all are executed */
const postTransformers = [postTransferTransformer]

/** describes the sequence and which are 'one of' */
const transformerSequence = [
  {
    oneOf: false,
    transformers: preTransformers,
  },
  {
    oneOf: true,
    transformers: mainTransformers,
  },
  {
    oneOf: false,
    transformers: postTransformers,
  },
]

export interface ITransformExplorerTransaction {
  transaction: ActivityTransaction | Transaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
}

export const transformTransaction = ({
  transaction,
  accountAddress,
  tokensByNetwork,
  nftContractAddresses,
}: ITransformExplorerTransaction): TransformedTransaction | undefined => {
  if (!transaction) {
    return
  }
  try {
    let result: TransformedTransaction = {
      action: "UNKNOWN",
      entity: "UNKNOWN",
    }

    for (const { oneOf, transformers } of transformerSequence) {
      for (const transformer of transformers) {
        const transformedResult = transformer({
          transaction,
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
          result,
        })
        if (transformedResult && oneOf) {
          /** only take a single result from this set */
          result = transformedResult
          continue
        } else {
          result = {
            ...result,
            ...transformedResult,
          }
        }
      }
    }
    return result
  } catch (e) {
    // don't throw on parsing error, UI will fallback to default
  }
}

export function showTokenId(networkId: string, tokenId: string): string {
  if (networkId === 'devnet') {
    return tokenId.replace(/[^a-zA-Z]/gi, '').slice(0, 4).toUpperCase()
  } else {
    return '???'
  }
}

export function transformReviewedTransaction(transaction: ReviewTransactionResult): TransformedAlephiumTransaction {
  let destinations: DestinationAddress[]
  switch (transaction.type) {
    case 'TRANSFER':
      destinations = transaction.params.destinations.map(d => ({ address: d.address, type: 'To' }))
      return {
        type: 'TRANSFER',
        destinations: destinations,
        transferType: getTransferType(destinations),
        amountChanges: extractAmountChanges(transaction.params.destinations)
      }
    case 'DEPLOY_CONTRACT':
      return {
        type: 'DEPLOY_CONTRACT',
        contractAddress: transaction.result.contractAddress,
        contractId: transaction.result.contractId,
        issueTokenAmount: transaction.params.issueTokenAmount
      }
    case 'EXECUTE_SCRIPT':
      return {
        type: 'EXECUTE_SCRIPT',
        bytecode: transaction.params.bytecode,
        host: transaction.params.host,
        attoAlphAmount: transaction.params.attoAlphAmount,
        tokens: transaction.params.tokens
      }
    case 'UNSIGNED_TX':
      return {
        type: 'UNSIGNED_TX',
        unsignedTx: transaction.params.unsignedTx
      }
  }
}

export function extractAmountChanges(destinations: Destination[]): AmountChanges {
  const result: AmountChanges = { attoAlphAmount: BigInt(0), tokens: {} }
  destinations.forEach(destination => {
    result.attoAlphAmount -= number256ToBigint(destination.attoAlphAmount)
    destination.tokens?.forEach(token => {
      result.tokens[token.id] ||= BigInt(0)
      result.tokens[token.id] -= number256ToBigint(token.amount)
    })
  })
  return result
}

export function extractExplorerTransaction(transaction: any): AlephiumExplorerTransaction | undefined {
  if (transaction.meta && transaction.meta.explorer && !transaction.meta.request) {
    return transaction.meta.explorer as AlephiumExplorerTransaction
  }
  if (transaction.inputs && transaction.outputs && transaction.hash) {
    return transaction as AlephiumExplorerTransaction
  }
  return undefined
}

export function getTransferType(destinations: DestinationAddress[]) {
  if (destinations.every(d => d.type === 'To')) {
    return 'Send'
  }
  if (destinations.every(d => d.type === 'From')) {
    return 'Receive'
  }
  return 'Exchange'
}
