import { defaultNetworkIds } from "../../../shared/network/defaults"

// TODO: These definitions should come from `token-list`, will remove
const whitelistedCollectionFromTokenList = [
  {
    "networkId": 2,
    "collections": [
      {
        "id": "00442685dc4d0c2e1fec687294dc411a0d2f35484f9c9bbc24eea6093eb06300"
      },
      {
        "id": "27306a177ec5607cd0020dde836577b54378d77635919a2ffce121feba4f5700"
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
