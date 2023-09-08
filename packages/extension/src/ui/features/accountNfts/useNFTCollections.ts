import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { SWRConfigCommon } from "../../services/swr"

import { Network } from "../../../shared/network"
import { fetchNFTCollections, fetchNFTCollection } from "./alephium-nft.service"
import { useNonFungibleTokensWithBalance } from "../accountTokens/tokens.state"

export const useNFTCollections = (
  network: Network,
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const nonFungibleTokens = useNonFungibleTokensWithBalance(account)
  const nonFungibleTokenIds = nonFungibleTokens.map((t) => t.id)

  const { data: collections, ...rest } = useSWR(
    account &&
    nonFungibleTokenIds.length > 0 &&
    [
      getAccountIdentifier(account),
      nonFungibleTokenIds,
      "collections",
    ],
    () => fetchNFTCollections(nonFungibleTokenIds, network),
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { collections: collections || [], ...rest }
}

export const useNFTCollection = (
  tokenIds: string[],
  network: Network,
  collectionId?: string,
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const { data: collection, ...rest } = useSWR(
    collectionId &&
    tokenIds.length > 0 &&
    account && [
      getAccountIdentifier(account),
      collectionId,
      tokenIds,
      "collection",
    ],
    async () => {
      if (collectionId) {
        return await fetchNFTCollection(collectionId, tokenIds, network)
      } else {
        return Promise.resolve(undefined)
      }
    },
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { collection, ...rest }
}
