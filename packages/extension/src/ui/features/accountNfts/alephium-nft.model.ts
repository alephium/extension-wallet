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
  nftIds: string[]
}

export type CollectionAndNFTMap = Record<string, string[]>
