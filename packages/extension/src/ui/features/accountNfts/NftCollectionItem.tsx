import { FC } from "react"
import { Network } from "../../../shared/network"
import { Account } from "../accounts/Account"
import { NftItem } from "./NftItem"
import { useNFTCollection } from "./useNFTCollections"
import { Flex, Spinner } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import { routes } from "../../routes"

interface NftCollectionItemProps {
  collectionId: string
  network: Network
  account: Account
  navigateToSend: boolean
}

const NftCollectionItem: FC<NftCollectionItemProps> = ({ network, collectionId, account, navigateToSend }) => {
  const navigate = useNavigate()
  const { collection } = useNFTCollection(network, collectionId, account)
  if (collection === undefined) {
    return (
      <Flex w="142px" h="142px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }
  return <NftItem
    onClick={() => {
      navigate(routes.collectionNfts(collectionId), {
        state: { navigateToSend },
      })
    }}
    name={collection.metadata.name}
    thumbnailSrc={collection.metadata.image}
    total={collection.nftIds.length}
  />
}

export { NftCollectionItem }