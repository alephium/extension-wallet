import { defaultNetworkIds } from "../../../shared/network/defaults"

// TODO: These definitions should come from `token-list`, will remove
const whitelistedCollectionFromTokenList = [
  {
    "networkId": 2,
    "collections": [
      {
        "id": "f1c647704b64f8041c37b0da468319b3b925e1feaff2b25ec3b2bb43a768b100"
      },
      {
        "id": "5314e562be269f7e1d73cafa1bfbac1f1533b849b8387de7404e7a26a8a04800"
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
