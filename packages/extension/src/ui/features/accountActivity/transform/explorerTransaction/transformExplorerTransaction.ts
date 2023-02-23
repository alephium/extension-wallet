import { Destination, fromApiNumber256, fromApiToken, SignTransferTxParams, SignTransferTxResult } from "@alephium/web3"
import { ReviewTransactionResult, TransactionPayload } from "../../../../../shared/actionQueue/types"
import { AlephiumExplorerTransaction, IExplorerTransaction } from "../../../../../shared/explorer/type"
import { Token } from "../../../../../shared/token/type"
import { TransformedTransaction } from "../type"
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
}: ITransformAlephiumExplorerTransaction): ReviewTransactionResult | undefined => {
  if (!explorerTransaction || !accountAddress) {
    return
  }
  try {
    const destinations = extractDestinations(explorerTransaction, accountAddress)

    if (destinations === undefined) {
      return
    } 

    const result: {
      type: "TRANSFER"
      params: TransactionPayload<SignTransferTxParams>
      result: Omit<SignTransferTxResult, "signature">
    } = {
      type: "TRANSFER",
      params: {
        signerAddress: accountAddress,
        destinations: destinations,
        networkId: '',
      },
      result: {
        fromGroup: 0,
        toGroup: 0,
        unsignedTx: '',
        txId: explorerTransaction.hash,
        gasAmount: 0, // TODO: remove this field
        gasPrice: BigInt(0) // TODO: remove this field
      }
    }
    return result
  } catch (e) {
    // don't throw on parsing error, UI will fallback to default
  }
}

function extractDestinations(explorerTransaction: AlephiumExplorerTransaction, accountAddress: string): Destination[] | undefined {
  if (!explorerTransaction.outputs) {
    return
  }

  const destinations: Record<string, Destination> = {}
  for (const output of explorerTransaction.outputs.filter(output => output.address !== accountAddress)) {
    destinations[output.address] ||= { address: output.address, attoAlphAmount: BigInt(0) }
    destinations[output.address].attoAlphAmount += BigInt(output.attoAlphAmount)
    if (output.tokens) {
      destinations[output.address].tokens ||= []
      destinations[output.address].tokens?.concat(output.tokens.map(fromApiToken))
    }
  }
  return Object.values(destinations)
}
