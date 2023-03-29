import { defaultNetworkIds } from "../../../shared/network/defaults"

// TODO: These definitions should come from `token-list`, will remove
const whitelistedCollectionFromTokenList = [
  {
    "networkId": 2,
    "collections": [
      {
        "id": "fda9906f8e2a31a08085a940babcd6e72aae5029848dc9b7f1d4bc62ad139900"
      },
      {
        "id": "8633b79d56d06d0d864227a34db1c96517359d7bc416872294a66dc878553100"
      }
    ]
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
