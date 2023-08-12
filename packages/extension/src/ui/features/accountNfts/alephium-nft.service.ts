import { whitelistedCollection, NFT } from "./alephium-nft.model"
import { NFTCollection } from "./alephium-nft.model"
import { Network } from "../../../shared/network"
import { addressFromContractId, binToHex, contractIdFromAddress, ExplorerProvider, NodeProvider } from "@alephium/web3"
import { fetchImmutable } from "../../../shared/utils/fetchImmutable"

export const fetchNFTCollections = async (
  nonFungibleTokenIds: string[],
  network: Network
): Promise<NFTCollection[]> => {
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  const nodeProvider = new NodeProvider(network.nodeUrl)

  const parentAndTokenIds: [string, string][] = []
  for (const tokenId of nonFungibleTokenIds) {
    try {
      const result = await fetchImmutable(`${tokenId}-parent`, () => explorerProvider.contracts.getContractsContractParent(addressFromContractId(tokenId)))
      if (result.parent) {
        const parentContractId = binToHex(contractIdFromAddress(result.parent))
        const parentStdInterfaceId = await fetchImmutable(`${parentContractId}-std`, () => nodeProvider.guessStdInterfaceId(parentContractId))

        // Guess if parent implements the NFT collection standard interface
        if (parentStdInterfaceId === '0002') {
          parentAndTokenIds.push([parentContractId, tokenId])
        }
      }
    } catch (e) {
      console.error("Error fetching parent for token id", e)
    }
  }

  const tokenIdsByNFTCollections = parentAndTokenIds.reduce((acc, parentAndTokenId) => {
    const [parent, tokenId] = parentAndTokenId
    if (!!parent && !!tokenId) {
      if (acc[parent]) {
        acc[parent].push(tokenId)
      } else {
        acc[parent] = [tokenId]
      }
    }

    return acc
  }, {} as Record<string, string[]>)

  const collections: NFTCollection[] = []
  for (const collectionId in tokenIdsByNFTCollections) {
    try {
      const nftIds = tokenIdsByNFTCollections[collectionId]
      const collectionMetadata = await getCollectionMetadata(collectionId, nodeProvider)
      const nfts: NFT[] = await getNFTs(collectionId, nftIds, nodeProvider)
      collections.push({
        id: collectionId,
        metadata: collectionMetadata,
        nfts: nfts,
        verified: isWhitelistedCollection(collectionId, network.id)
      })
    } catch (e) {
      console.log(`Error fetching NFT collection ${collectionId}`, e)
    }
  }

  return collections
}

async function getNftIds(
  collectionAddress: string,
  tokenIds: string[],
  explorerProvider: ExplorerProvider,
  finalNftIds: string[] = [],
  page = 1
): Promise<string[]> {
  const pageSize = 100
  const { subContracts } = await explorerProvider.contracts.getContractsContractSubContracts(collectionAddress, { page, limit: pageSize })

  if (!subContracts) {
    return finalNftIds
  }

  const nftIds = tokenIds.filter((tokenId) => subContracts.includes(addressFromContractId(tokenId)))
  if (nftIds.length > 0) {
    finalNftIds.push(...nftIds)
  }

  if (subContracts.length < pageSize) {
    return finalNftIds
  } else {
    return getNftIds(collectionAddress, tokenIds, explorerProvider, finalNftIds, page + 1)
  }
}

export const fetchNFTCollection = async (
  collectionId: string,
  tokenIds: string[],
  network: Network,
): Promise<NFTCollection | undefined> => {
  try {
    const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
    const nodeProvider = new NodeProvider(network.nodeUrl)
    const collectionAddress = addressFromContractId(collectionId)
    const nftIds = await getNftIds(collectionAddress, tokenIds, explorerProvider)

    if (!nftIds) {
      return undefined
    }

    const collectionMetadata = await getCollectionMetadata(collectionId, nodeProvider)
    const nfts: NFT[] = await getNFTs(collectionId, nftIds, nodeProvider)
    return {
      id: collectionId,
      metadata: collectionMetadata,
      nfts: nfts,
      verified: isWhitelistedCollection(collectionId, network.id)
    }
  } catch (e) {
    console.log(`Error fetching NFT collection ${collectionId}`, e)
    return undefined
  }
}

async function getNFTs(
  collectionId: string,
  nftIds: string[],
  nodeProvider: NodeProvider
): Promise<NFT[]> {
  const nfts: NFT[] = [];

  for (const nftId of nftIds) {
    try {
      const nftMetadata = await nodeProvider.fetchNFTMetaData(nftId)
      const metadataResponse = await fetch(nftMetadata.tokenUri)
      const metadata = await metadataResponse.json()
      nfts.push({
        id: nftId,
        collectionId: collectionId,
        metadata: metadata
      })
    } catch (e) {
      console.error("Error fetching NFT", nftId)
    }
  }

  return nfts
}

async function getCollectionMetadata(
  collectionId: string,
  nodeProvider: NodeProvider
) {
  const metadata = await nodeProvider.fetchNFTCollectionMetaData(collectionId)
  const metadataResponse = await fetch(metadata.collectionUri)
  return await metadataResponse.json()
}

function isWhitelistedCollection(collectionId: string, networkId: string): boolean {
  return networkId === 'devnet' || whitelistedCollection[networkId].includes(collectionId)
}