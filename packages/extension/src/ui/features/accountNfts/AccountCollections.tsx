import { H4 } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { EmptyCollections } from "./EmptyCollections"
import { NftFigure } from "./NftFigure"
import { useCollectionAndNFTs } from "./useNFTCollections"
import { useNetwork } from "../networks/useNetworks"
import { Spinner } from "../../components/Spinner"
import { NftCollectionItem } from "./NftCollectionItem"

interface AccountCollectionsProps {
  account: Account
  withHeader?: boolean
  navigateToSend?: boolean
}

const Collections: FC<AccountCollectionsProps> = ({
  account,
  navigateToSend = false,
}) => {
  const navigate = useNavigate()
  const network = useNetwork(account.networkId)
  const { collectionAndNfts } = useCollectionAndNFTs(network, account)
  const collectionIds = Object.keys(collectionAndNfts)

  return (
    <>
      {collectionIds.length === 0 && (
        <EmptyCollections networkId={account.networkId} />
      )}

      {collectionIds.length > 0 && (
        <SimpleGrid
          gridTemplateColumns="repeat(auto-fill, 158px)"
          gap="3"
          py={4}
          mx="3"
        >
          {collectionIds.map((collectionId) => (
            <NftFigure
              key={collectionId}
              onClick={() => {
                navigate(routes.collectionNfts(collectionId), {
                  state: { navigateToSend },
                })
              }}
            >
              <NftCollectionItem
                collectionId={collectionId}
                network={network}
                account={account}
              />
            </NftFigure>
          ))}
        </SimpleGrid>
      )
      }
    </>
  )
}

export const AccountCollections: FC<AccountCollectionsProps> = ({
  account,
  withHeader = true,
  navigateToSend,
  ...rest
}) => {
  return (
    <>
      {withHeader && <H4 textAlign="center">NFTs</H4>}
      <Flex direction="column" flex={1} {...rest}>
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <Collections
            account={account}
            navigateToSend={navigateToSend}
          />
        </Suspense>
      </Flex>
    </>
  )
}
