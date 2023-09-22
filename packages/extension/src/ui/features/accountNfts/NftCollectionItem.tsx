import { FC } from "react"
import { Network } from "../../../shared/network"
import { Account } from "../accounts/Account"
import { NftItem } from "./NftItem"
import { useNFTCollection } from "./useNFTCollections"
import { Flex, Spinner } from "@chakra-ui/react"

interface NftCollectionItemProps {
  collectionId: string
  network: Network
  account: Account
}

const NftCollectionItem: FC<NftCollectionItemProps> = ({ network, collectionId, account }) => {
  const { collection } = useNFTCollection(network, collectionId, account)
  if (collection === undefined) {
    return (
      <Flex w="142px" h="142px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }
  return <NftItem
    name={collection.metadata.name}
    thumbnailSrc={collection.metadata.image}
    total={collection.nftIds.length}
    unverifiedCollection={!collection.verified}
  />
}

export { NftCollectionItem }