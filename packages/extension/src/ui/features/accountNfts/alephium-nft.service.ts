import { NFT, CollectionAndNFTMap } from "./alephium-nft.model"
import { NFTCollection } from "./alephium-nft.model"
import { Network } from "../../../shared/network"
import { addressFromContractId, binToHex, contractIdFromAddress, ExplorerProvider, NodeProvider } from "@alephium/web3"
import { fetchImmutable } from "../../../shared/utils/fetchImmutable"

export const fetchCollectionAndNfts = async (
  nonFungibleTokenIds: string[],
  network: Network
): Promise<CollectionAndNFTMap> => {
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  const nodeProvider = new NodeProvider(network.nodeUrl)

  const parentAndTokenIds: CollectionAndNFTMap = {}
  for (const tokenId of nonFungibleTokenIds) {
    try {
      const result = await fetchImmutable(`${tokenId}-parent`, () => explorerProvider.contracts.getContractsContractAddressParent(addressFromContractId(tokenId)))
      if (result.parent) {
        const parentContractId = binToHex(contractIdFromAddress(result.parent))
        const isFollowNFTCollectionStd = await fetchImmutable(`${parentContractId}-std`, () => nodeProvider.guessFollowsNFTCollectionStd(parentContractId))

        // Guess if parent implements the NFT collection standard interface
        if (isFollowNFTCollectionStd) {
          if (parentAndTokenIds[parentContractId]) {
            parentAndTokenIds[parentContractId].push(tokenId)
          } else {
            parentAndTokenIds[parentContractId] = [tokenId]
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching parent for collection id for NFT ${tokenId}`, e)
    }
  }
  return parentAndTokenIds
}

export const fetchNFTCollection = async (
  collectionId: string,
  nftIds: string[],
  network: Network
): Promise<NFTCollection | undefined> => {
  try {
    const nodeProvider = new NodeProvider(network.nodeUrl)
    const collectionMetadata = await getCollectionMetadata(collectionId, nodeProvider)
    return {
      id: collectionId,
      metadata: collectionMetadata,
      nftIds: nftIds
    }
  } catch (error) {
    console.log(`Error fetching NFT collection ${collectionId}, error: ${error}`)
    return undefined
  }
}

export async function getNFT(collectionId: string, nftId: string, network: Network): Promise<NFT | undefined> {
  try {
    const nodeProvider = new NodeProvider(network.nodeUrl)
    const nftMetadata = await nodeProvider.fetchNFTMetaData(nftId)
    const metadataResponse = await fetch(nftMetadata.tokenUri)
    const metadata = await metadataResponse.json()
    return {
      id: nftId,
      collectionId: collectionId,
      metadata: metadata
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Deprecated NFT contract')) {
      throw error
    }
    console.log(`Error fetching NFT ${nftId}, error: ${error}`)
    return undefined
  }
}

async function getCollectionMetadata(
  collectionId: string,
  nodeProvider: NodeProvider
) {
  const metadata = await nodeProvider.fetchNFTCollectionMetaData(collectionId)
  const metadataResponse = await fetch(metadata.collectionUri)
  return await metadataResponse.json()
}
