import { FC } from "react"
import { Network } from "../../../shared/network"
import { Account } from "../accounts/Account"
import { NftItem } from "./NftItem"
import { useNFT } from "./useNfts"
import { Flex, Spinner } from "@chakra-ui/react"

interface NftProps {
  collectionId: string
  nftId: string
  network: Network
  account?: Account
}

const Nft: FC<NftProps> = ({ collectionId, nftId, account, network }) => {
  const { nft } = useNFT(network, collectionId, nftId, account)
  if (nft === undefined) {
    return (
      <Flex w="142px" h="142px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }
  return <NftItem
    thumbnailSrc={nft.metadata.image || ""}
    name={
      nft.metadata.name ||
      "Untitled"
    }
  />
}

export { Nft }