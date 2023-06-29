import { whitelistedCollection, NFT } from "./alephium-nft.model"
import { NFTCollection } from "./alephium-nft.model"
import { Network } from "../../../shared/network"
import { addressFromContractId, binToHex, contractIdFromAddress, ExplorerProvider, NodeProvider } from "@alephium/web3"
import { fetchImmutable } from "../../../shared/utils/fetchImmutable"

export const fetchNFTCollections = async (
  tokenIds: string[],
  network: Network
): Promise<NFTCollection[]> => {
  const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
  const nodeProvider = new NodeProvider(network.nodeUrl)

  const parentAndTokenIds: [string, string][] = []
  for (const tokenId of tokenIds) {
    try {
      const result = await fetchImmutable(`${tokenId}-parent`, () => explorerProvider.contracts.getContractsContractParent(addressFromContractId(tokenId)))
      if (result.parent) {
        const parentContractId = binToHex(contractIdFromAddress(result.parent))
        const parentStdInterfaceId = await fetchImmutable(`${parentContractId}-std`, () => nodeProvider.guessStdInterfaceId(parentContractId))
        const tokenStdInterfaceId = await fetchImmutable(`${tokenId}-std`, () => nodeProvider.guessStdInterfaceId(tokenId))

        // Guess if parent implements the NFT collection standard interface and child implements the NFT standard interface
        if (parentStdInterfaceId === '0002' && tokenStdInterfaceId === '0003') {
          parentAndTokenIds.push([parentContractId, tokenId])
        }
      }
    } catch (e) {
      console.error("Error fetching parent for token id", e)
    }
  }

  const tokenIdsByWhitelistedNFTCollections = parentAndTokenIds.reduce((acc, parentAndTokenId) => {
    const [parent, tokenId] = parentAndTokenId
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
    try {
      const nftIds = tokenIdsByWhitelistedNFTCollections[whitelistedCollectionId]
      const collectionMetadata = await getCollectionMetadata(whitelistedCollectionId, nodeProvider)
      const nfts: NFT[] = await getNFTs(whitelistedCollectionId, nftIds, nodeProvider)
      collections.push({
        id: whitelistedCollectionId,
        metadata: collectionMetadata,
        nfts: nfts
      })
    } catch (e) {
      console.log(`Error fetching NFT collection ${whitelistedCollectionId}`, e)
    }
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

  try {
    const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
    const nodeProvider = new NodeProvider(network.nodeUrl)
    const collectionAddress = addressFromContractId(collectionId)
    const { subContracts } = await explorerProvider.contracts.getContractsContractSubContracts(collectionAddress)
    const nftIds = subContracts && tokenIds.filter((tokenId) => subContracts.includes(addressFromContractId(tokenId)))

    if (!nftIds) {
      return undefined
    }

    const collectionMetadata = await getCollectionMetadata(collectionId, nodeProvider)
    const nfts: NFT[] = await getNFTs(collectionId, nftIds, nodeProvider)
    return {
      id: collectionId,
      metadata: collectionMetadata,
      nfts: nfts
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
      const nftMetadata = nodeProvider.fetchNFTMetaData(nftId)
      const metadataResponse = await fetch((await nftMetadata).tokenUri)
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

// Not sure we should have a whitelisted NFT collections, disable for now
function isWhitelistedCollection(collectionId: string, networkId: string): boolean {
  return true
  //return networkId === 'devnet' || networkId === 'testnet' || whitelistedCollection[networkId].includes(collectionId)
}