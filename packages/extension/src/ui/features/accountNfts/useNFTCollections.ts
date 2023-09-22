import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { SWRConfigCommon } from "../../services/swr"

import { Network } from "../../../shared/network"
import { fetchNFTCollection, fetchCollectionAndNfts } from "./alephium-nft.service"
import { useNonFungibleTokensWithBalance } from "../accountTokens/tokens.state"

export const useCollectionAndNFTs = (
  network: Network,
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const nonFungibleTokens = useNonFungibleTokensWithBalance(account)
  const nonFungibleTokenIds = nonFungibleTokens.map((t) => t.id)

  const { data: collectionAndNfts, ...rest } = useSWR(
    account && nonFungibleTokenIds.length > 0 && [getAccountIdentifier(account), 'collectionAndNft'],
    () => fetchCollectionAndNfts(nonFungibleTokenIds, network),
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    }
  )

  return { collectionAndNfts: collectionAndNfts || {}, ...rest }
}

export const useNFTCollection = (
  network: Network,
  collectionId?: string,
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const { collectionAndNfts } = useCollectionAndNFTs(network, account, config)
  const nftIds = collectionId === undefined ? [] : (collectionAndNfts[collectionId] ?? [])
  const { data: collection, ...rest } = useSWR(
    account && collectionId && [getAccountIdentifier(account), collectionId, 'collection'],
    () => collectionId ? fetchNFTCollection(collectionId, nftIds, network) : undefined,
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )
  return { collection, ...rest }
}
