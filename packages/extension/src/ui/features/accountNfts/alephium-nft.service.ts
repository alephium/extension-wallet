import { NFT, CollectionAndNFTMap } from "./alephium-nft.model"
import { NFTCollection } from "./alephium-nft.model"
import { Network } from "../../../shared/network"
import { ExplorerProvider, NodeProvider } from "@alephium/web3"
import { fetchImmutable, getImmutable, storeImmutable } from "../../../shared/utils/fetchImmutable"
import { chunk } from 'lodash'
import { NFTMetadata } from "@alephium/web3/dist/src/api/api-explorer"

export const fetchCollectionAndNfts = async (
  nftIds: string[],
  network: Network
): Promise<CollectionAndNFTMap> => {
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  const parentAndTokenIds: CollectionAndNFTMap = {}

  const nftMetadataz = await getNftMetadataz(nftIds, explorerProvider)
  for (const nftMetadata of nftMetadataz) {
    const tokenId = nftMetadata.id
    const collectionId = nftMetadata.collectionId
    if (parentAndTokenIds[collectionId]) {
      parentAndTokenIds[collectionId].push(tokenId)
    } else {
      parentAndTokenIds[collectionId] = [tokenId]
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
    const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)
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
    const nodeProvider = new NodeProvider(network.nodeUrl, network.nodeApiKey)
    const nftMetadata = await fetchImmutable(`nft-metadata-${nftId}`, () => nodeProvider.fetchNFTMetaData(nftId))
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
  const metadata = await fetchImmutable(`nft-collection-metadata-${collectionId}`, () => nodeProvider.fetchNFTCollectionMetaData(collectionId))
  const metadataResponse = await fetch(metadata.collectionUri)
  return await metadataResponse.json()
}

async function getNftMetadataz(nftIds: string[], explorerProvider: ExplorerProvider) {
  const maxSizeTokens = 80
  const cachedNftMetadataz: NFTMetadata[] = []
  const nftIdsWithoutMetadata: string[] = []
  for (const nftId of nftIds) {
    const metadata = await getImmutable<NFTMetadata>(`${nftId}-nft-metadata`)
    if (metadata?.id) {
      cachedNftMetadataz.push(metadata)
    } else {
      nftIdsWithoutMetadata.push(nftId)
    }
  }

  const newNftMetadataz: NFTMetadata[] = []
  if (nftIdsWithoutMetadata.length !== 0) {
    for (const ids of chunk(nftIdsWithoutMetadata, maxSizeTokens)) {
      const newMetadataz = await explorerProvider.tokens.postTokensNftMetadata(ids)
      newNftMetadataz.push(...newMetadataz)
      for (const newMetadata of newMetadataz) {
        await storeImmutable(`${newMetadata.id}-nft-metadata`, newMetadata)
      }
    }
  }

  return cachedNftMetadataz.concat(newNftMetadataz)
}

export const isMp4Url = (url: string) => {
  return url.toLowerCase().endsWith('.mp4')
}
