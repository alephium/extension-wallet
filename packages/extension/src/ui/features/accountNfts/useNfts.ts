import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { isEqualAddress } from "../../services/addresses"
import { SWRConfigCommon } from "../../services/swr"
import { AspectNft } from "./aspect.model"

interface IGetNft {
  nfts?: AspectNft[]
  contractAddress: string
  tokenId: string
}

export const getNft = ({ nfts, contractAddress, tokenId }: IGetNft) => {
  if (!nfts) {
    return
  }
  const nft = nfts.find(
    ({ contract_address, token_id }) =>
      isEqualAddress(contract_address, contractAddress) && token_id === tokenId,
  )
  return nft
}
