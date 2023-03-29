import { whitelistedCollection, NFT } from "./alephium-nft.model"
import { NFTCollection } from "./alephium-nft.model"
import { Network } from "../../../shared/network"
import { addressFromContractId, binToHex, contractIdFromAddress, ExplorerProvider, groupOfAddress, hexToString, NodeProvider } from "@alephium/web3"
import { ValByteVec } from "@alephium/web3/dist/src/api/api-alephium"

export const fetchNFTCollections = async (
  tokenIds: string[],
  network: Network
): Promise<NFTCollection[]> => {
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  const nodeProvider = new NodeProvider(network.nodeUrl)
  const parentAndTokenIds = await Promise.all(tokenIds.map(async (tokenId) => {
    const { parent } = await explorerProvider.contracts.getContractsContractParent(addressFromContractId(tokenId))
    return [parent && binToHex(contractIdFromAddress(parent)), tokenId]
  }))

  const tokenIdsByWhitelistedNFTCollections = parentAndTokenIds.reduce((acc, parentAndTokenId) => {
    const parent = parentAndTokenId[0]
    const tokenId = parentAndTokenId[1]
    if (!!parent && !!tokenId && isWhitelistedCollection(parent, network.id)) {
      if (acc[parent]) {
        acc[parent].push(tokenId)
      } else {
        acc[parent] = [tokenId]
      }
    }

    return acc
  }, {} as Record<string, string[]>)

  const collections: NFTCollection[] = []
  for (const whitelistedCollectionId in tokenIdsByWhitelistedNFTCollections) {
    const collectionAddress = addressFromContractId(whitelistedCollectionId)
    const nftIds = tokenIdsByWhitelistedNFTCollections[whitelistedCollectionId]
    const collectionMetadata = await getCollectionMetadata(collectionAddress, nodeProvider)
    const nfts: NFT[] = await getNFTs(whitelistedCollectionId, nftIds, nodeProvider)

    collections.push({
      id: whitelistedCollectionId,
      metadata: collectionMetadata,
      nfts: nfts
    })
  }

  return collections
}

export const fetchNFTCollection = async (
  collectionId: string,
  tokenIds: string[],
  network: Network,
): Promise<NFTCollection | undefined> => {
  if (!isWhitelistedCollection(collectionId, network.id)) {
    return undefined
  }

  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  const nodeProvider = new NodeProvider(network.nodeUrl)
  const collectionAddress = addressFromContractId(collectionId)
  const { subContracts } = await explorerProvider.contracts.getContractsContractSubContracts(collectionAddress)
  const nftIds = subContracts && tokenIds.filter((tokenId) => subContracts.includes(addressFromContractId(tokenId)))

  if (!nftIds) {
    return undefined
  }

  const collectionMetadata = await getCollectionMetadata(collectionAddress, nodeProvider)
  const nfts: NFT[] = await getNFTs(collectionId, nftIds, nodeProvider)
  return {
    id: collectionId,
    metadata: collectionMetadata,
    nfts: nfts
  }
}

async function getNFTs(
  collectionId: string,
  nftIds: string[],
  nodeProvider: NodeProvider
): Promise<NFT[]> {
  return await Promise.all(nftIds.map(async (nftId) => {
    const nftAddress = addressFromContractId(nftId)
    const nftState = await nodeProvider.contracts.getContractsAddressState(
      nftAddress,
      { group: groupOfAddress(nftAddress) }
    )
    const metadataUri = hexToString((nftState.immFields[1] as ValByteVec).value)
    const metadataResponse = await fetch(metadataUri)
    const metadata = await metadataResponse.json()
    return {
      id: nftId,
      collectionId: collectionId,
      metadata: metadata
    }
  }))
}

async function getCollectionMetadata(
  collectionAddress: string,
  nodeProvider: NodeProvider
) {
  const collectionState = await nodeProvider.contracts.getContractsAddressState(
    collectionAddress,
    { group: groupOfAddress(collectionAddress) }
  )

  const metadataUri = hexToString((collectionState.immFields[1] as ValByteVec).value)
  const metadataResponse = await fetch(metadataUri)
  return await metadataResponse.json()
}

function isWhitelistedCollection(collectionId: string, networkId: string): boolean {
  //return networkId === 'devnet' || whitelistedCollections[networkId].includes(parent)
  // FIXME: probably should check codeHash for local devnet
  return whitelistedCollection[networkId].includes(collectionId)
}