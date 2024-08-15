import useSWR from "swr"
import { Network } from "../../../shared/network"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { SWRConfigCommon, retryWhenRateLimited } from "../../services/swr"
import { getNFT } from "./alephium-nft.service"
import { laggy } from "./laggy"

export const useNFT = (
  network: Network,
  collectionId?: string,
  nftId?: string,
  account?: BaseWalletAccount,
  config?: SWRConfigCommon,
) => {
  const { data: nft, ...rest } = useSWR(
    account && collectionId && nftId && [getAccountIdentifier(account), collectionId, nftId, 'nft'],
    () => (collectionId && nftId) ? getNFT(collectionId, nftId, network) : undefined,
    {
      ...config,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      use: [laggy],
      suspense: true,
      shouldRetryOnError: retryWhenRateLimited
    },
  )
  return { nft, ...rest }
}
