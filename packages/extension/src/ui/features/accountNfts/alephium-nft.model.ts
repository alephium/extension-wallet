import { defaultNetworkIds } from "../../../shared/network/defaults"

// TODO: These definitions should come from `token-list`, will remove
const knownCollectionsFromTokenList = [
  {
    "networkId": 2,
    "collections": [
      {
        "id": "824a23d11655790d23d245529260102e1237da4bfed955ed542fffc027a71200",
      }
    ]
  }
]

export interface NFTCollectionMeta {
  name: string,
  description: string,
  image: string,
  totalSupply: bigint
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
  contractId: string,
  metadata: NFTCollectionMeta,
  nfts: NFT[]
}

export type NFTCollections = NFTCollection[]

export const knownCollections: Record<string, string[]> = knownCollectionsFromTokenList
  .reduce((acc, collections) => {
    acc[defaultNetworkIds[collections.networkId]] = collections.collections.map(c => c.id)
    return acc
  }, {} as Record<string, string[]>)
