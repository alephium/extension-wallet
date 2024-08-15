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

  // TODO: Fix explorer backend for 000301 NFTs
  if (nftMetadataz.length != nftIds.length) {
    const nodeProvider = new NodeProvider(network.nodeUrl)
    const otherNonFungibleTokenIds = nftIds.filter(id => nftMetadataz.findIndex((m) => m.id == id) == -1)
    for (const tokenId of otherNonFungibleTokenIds) {
      const nftMetadata = await fetchImmutable(`${tokenId}-nft-metadata`, () => nodeProvider.fetchNFTMetaData(tokenId))
      const collectionId = nftMetadata.collectionId
      if (parentAndTokenIds[collectionId]) {
        parentAndTokenIds[collectionId].push(tokenId)
      } else {
        parentAndTokenIds[collectionId] = [tokenId]
      }
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
    const nftMetadata = await fetchImmutable(`${nftId}-nft-metadata`, () => nodeProvider.fetchNFTMetaData(nftId))
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
  const metadata = await fetchImmutable(`${collectionId}-nft-collection-metadata`, () => nodeProvider.fetchNFTCollectionMetaData(collectionId))
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

  const newNftMetadataz = (await Promise.all(
    chunk(nftIdsWithoutMetadata, maxSizeTokens).map((ids) =>
      explorerProvider.tokens.postTokensNftMetadata(ids)
    )
  )).flat()

  for (const newNftMetadata of newNftMetadataz) {
    await storeImmutable(`${newNftMetadata.id}-nft-metadata`, newNftMetadata)
  }

  return cachedNftMetadataz.concat(newNftMetadataz)
}