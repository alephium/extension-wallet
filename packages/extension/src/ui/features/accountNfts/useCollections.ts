import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { SWRConfigCommon } from "../../services/swr"

import { Network } from "../../../shared/network"
import { fetchNFTCollections, fetchNFTCollection } from "./alephium-nft.service"

export const useCollections = (
  tokenIds: string[],
  network: Network,
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const { data: collections, ...rest } = useSWR(
    account && [
      getAccountIdentifier(account),
      "collections",
    ],
    () => fetchNFTCollections(tokenIds, network),
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )

  return { collections: collections || [], ...rest }
}

export const useCollection = (
  tokenIds: string[],
  network: Network,
  collectionId?: string,
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const { data: collection, ...rest } = useSWR(
    collectionId &&
    account && [
      getAccountIdentifier(account),
      collectionId,
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
