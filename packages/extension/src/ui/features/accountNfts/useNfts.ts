import useSWR from "swr"
import { Network } from "../../../shared/network"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { SWRConfigCommon } from "../../services/swr"
import { getNFT } from "./alephium-nft.service"

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
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
      ...config,
    },
  )
  return { nft, ...rest }
}
