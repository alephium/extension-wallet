import { FC } from "react"
import { Network } from "../../../shared/network"
import { Account } from "../accounts/Account"
import { NftItem } from "./NftItem"
import { useNFT } from "./useNfts"
import { Flex, Spinner } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"

interface NftProps {
  collectionId: string
  nftId: string
  network: Network
  account?: Account
}

const Nft: FC<NftProps> = ({ collectionId, nftId, account, network }) => {
  const navigate = useNavigate()
  const { nft } = useNFT(network, collectionId, nftId, account)
  if (nft === undefined) {
    return (
      <Flex w="142px" h="142px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }
  return <NftItem
    onClick={() => navigate(routes.sendNft(collectionId, nftId))}
    thumbnailSrc={nft.metadata.image || ""}
    name={nft.metadata.name || "Untitled"}
  />
}

export { Nft }