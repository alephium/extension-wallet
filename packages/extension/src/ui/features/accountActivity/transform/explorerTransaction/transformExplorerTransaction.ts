import { Address, number256ToBigint } from "@alephium/web3"
import { AlephiumExplorerTransaction, IExplorerTransaction } from "../../../../../shared/explorer/type"
import { Token } from "../../../../../shared/token/type"
import { getTransferType } from "../transaction/transformTransaction"
import { AmountChanges, DestinationAddress, TransferTransformedAlephiumTransaction, TransformedAlephiumTransaction, TransformedTransaction } from "../type"
import { fingerprintExplorerTransaction } from "./fingerprintExplorerTransaction"
import accountCreateTransformer from "./transformers/accountCreateTransformer"
import accountUpgradeTransformer from "./transformers/accountUpgradeTransformer"
import dappAlphaRoadSwapTransformer from "./transformers/dappAlphaRoadSwapTransformer"
import dappAspectBuyNFTTransformer from "./transformers/dappAspectBuyNFTTransformer"
import dappInfluenceMintTransformer from "./transformers/dappInfluenceMintTransformer"
import dappJediswapSwapTransformer from "./transformers/dappJediswapSwapTransformer"
import dappMintSquareBuyNFTTransformer from "./transformers/dappMintSquareBuyNFTTransformer"
import dappMySwapSwapTransformer from "./transformers/dappMySwapSwapTransformer"
import dateTransformer from "./transformers/dateTransformer"
import defaultDisplayNameTransformer from "./transformers/defaultDisplayNameTransformer"
import feesTransformer from "./transformers/feesTransformer"
import knownDappTransformer from "./transformers/knownDappTransformer"
import knownNftTransformer from "./transformers/knownNftTransformer"
import postSwapTransformer from "./transformers/postSwapTransformer"
import postTransferTransformer from "./transformers/postTransferTransformer"
import tokenApproveTransformer from "./transformers/tokenApproveTransformer"
import tokenMintTransformer from "./transformers/tokenMintTransformer"
import tokenTransferTransformer from "./transformers/tokenTransferTransformer"

/** all are executed */
const preTransformers = [
  dateTransformer,
  defaultDisplayNameTransformer,
  feesTransformer,
  knownDappTransformer,
]

/** all are executed until one returns */

// TODO: add declare ad deploy contract transformers after backend update
const mainTransformers = [
  accountCreateTransformer,
  accountUpgradeTransformer,
  dappAlphaRoadSwapTransformer,
  dappAspectBuyNFTTransformer,
  dappInfluenceMintTransformer,
  dappJediswapSwapTransformer,
  dappMintSquareBuyNFTTransformer,
  dappMySwapSwapTransformer,
  knownNftTransformer,
  tokenMintTransformer,
  tokenTransferTransformer,
  tokenApproveTransformer,
]

/** all are executed */
const postTransformers = [postTransferTransformer, postSwapTransformer]

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
  explorerTransaction: IExplorerTransaction
  accountAddress?: string
  tokensByNetwork?: Token[]
  nftContractAddresses?: string[]
}

/**
 *
 * Takes an explorer transaction {@link ITransformExplorerTransaction}
 * and passes it through the transformers defined above
 *
 * The result includes rich information about the transaction {@link TransformedTransaction}
 *
 * @returns the transformation result, or undefined if transformation failed
 *
 */

export const transformExplorerTransaction = ({
  explorerTransaction,
  accountAddress,
  tokensByNetwork,
  nftContractAddresses,
}: ITransformExplorerTransaction): TransformedTransaction | undefined => {
  if (!explorerTransaction) {
    return
  }
  try {
    let result: TransformedTransaction = {
      action: "UNKNOWN",
      entity: "UNKNOWN",
    }

    const fingerprint = fingerprintExplorerTransaction(explorerTransaction)

    for (const { oneOf, transformers } of transformerSequence) {
      for (const transformer of transformers) {
        const transformedResult = transformer({
          explorerTransaction,
          accountAddress,
          tokensByNetwork,
          nftContractAddresses,
          result,
          fingerprint,
        })
        if (transformedResult && oneOf) {
          /** only take a single result from this set */
          result = transformedResult
          break
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

export interface ITransformAlephiumExplorerTransaction {
  explorerTransaction: AlephiumExplorerTransaction
  accountAddress?: string
}

export const transformAlephiumExplorerTransaction = ({
  explorerTransaction,
  accountAddress,
}: ITransformAlephiumExplorerTransaction): TransformedAlephiumTransaction | undefined => {
  if (!accountAddress) {
    return
  }
  try {
    const destinations = extractDestinations(explorerTransaction, accountAddress)
    if (!(explorerTransaction.inputs?.length) && destinations.length === 0) { // coinbase transaction
      return {
        type: "TRANSFER",
        transferType: "Receive",
        destinations: [{address: "Genesis", type: "From"}],
        amountChanges: extractAmountChanges(explorerTransaction, accountAddress)
      }
    } 
    const result: TransferTransformedAlephiumTransaction = {
      type: "TRANSFER",
      transferType: getTransferType(destinations),
      destinations: destinations,
      amountChanges: extractAmountChanges(explorerTransaction, accountAddress)
    }
    return result
  } catch (e) {
    // don't throw on parsing error, UI will fallback to default
  }
}

function extractDestinations(explorerTransaction: AlephiumExplorerTransaction, accountAddress: string): DestinationAddress[] {
  if (!explorerTransaction.outputs) {
    return []
  }

  const destinations: Record<Address, DestinationAddress['type']> = {}
  explorerTransaction.inputs?.forEach(input => {
    if (input.address !== undefined && input.address !== accountAddress) {
      destinations[input.address] = 'From'
    }
  })
  explorerTransaction.outputs?.forEach(output => {
    if (output.address !== accountAddress) {
      if (output.address in destinations) {
        if (destinations[output.address] === 'From') {
          destinations[output.address] === 'From/To'
        }
      } else {
        destinations[output.address] = 'To'
      }
    }
  })
  return Object.entries(destinations).map(pair => ({ address: pair[0], type: pair[1]}))
}

function extractAmountChanges(explorerTransation: AlephiumExplorerTransaction, accountAddress: string): AmountChanges {
  const result: AmountChanges = { attoAlphAmount: BigInt(0), tokens: {} }
  explorerTransation.inputs?.forEach(input => {
    if (input.address === accountAddress) {
      if (input.attoAlphAmount) {
        result.attoAlphAmount -= number256ToBigint(input.attoAlphAmount)
      }
      input.tokens?.forEach(token => {
        result.tokens[token.id] ||= BigInt(0)
        result.tokens[token.id] -= number256ToBigint(token.amount)
      })
    }
  })
  explorerTransation.outputs?.forEach(output => {
    if (output.address === accountAddress) {
      if (output.attoAlphAmount) {
        result.attoAlphAmount += number256ToBigint(output.attoAlphAmount)
      }
      output.tokens?.forEach(token => {
        result.tokens[token.id] ||= BigInt(0)
        result.tokens[token.id] += number256ToBigint(token.amount)
      })
    }
  })
  const gasFeePayer = explorerTransation.inputs?.at(0)?.address
  if (gasFeePayer === accountAddress) {
    const gasFee = BigInt(explorerTransation.gasAmount) * BigInt(explorerTransation.gasPrice)
    result.attoAlphAmount += gasFee
  }
  return result
}
