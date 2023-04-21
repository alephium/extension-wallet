import { defaultNetworkIds } from "../../../shared/network/defaults"
import { mainnetNFTCollectionsMetadata, testnetNFTCollectionsMetadata } from "@alephium/token-list"

// TODO: These definitions should come from `token-list`, will remove
const whitelistedCollectionFromTokenList = [
  {
    "networkId": mainnetNFTCollectionsMetadata.networkId,
    "collections": mainnetNFTCollectionsMetadata.nftCollections
  },
  {
    "networkId": testnetNFTCollectionsMetadata.networkId,
    "collections": testnetNFTCollectionsMetadata.nftCollections
  }
]

export interface NFTCollectionMeta {
  name: string
  description: string
  image: string
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
}

export interface NFT {
  id: string,
  collectionId: string,
  metadata: NFTMetadata
}

export interface NFTCollection {
  id: string
  metadata: NFTCollectionMeta
  nfts: NFT[]
}

export type NFTCollections = NFTCollection[]

export const whitelistedCollection: Record<string, string[]> = whitelistedCollectionFromTokenList
  .reduce((acc, collections) => {
    acc[defaultNetworkIds[collections.networkId]] = collections.collections.map(c => c.id)
    return acc
  }, {} as Record<string, string[]>)
