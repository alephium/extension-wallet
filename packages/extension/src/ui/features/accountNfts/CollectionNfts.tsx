import { BarBackButton, H1, H4, H6, NavigationContainer } from "@argent/ui"
import { Flex, Image, SimpleGrid } from "@chakra-ui/react"
import { FC } from "react"
import { Location, useLocation, useNavigate, useParams } from "react-router-dom"

import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useTokensWithBalance } from "../accountTokens/tokens.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { NftFigure } from "./NftFigure"
import { NftItem } from "./NftItem"
import { useCollection } from "./useCollections"

interface LocationWithState extends Location {
  state: {
    navigateToSend?: boolean
  }
}

export const CollectionNfts: FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const { state } = useLocation() as LocationWithState

  const navigateToSend = state?.navigateToSend || false

  const tokensWithBalances = useTokensWithBalance(account)
  const tokenIds = tokensWithBalances.tokenDetails.map((token) => token.id)
  const network = useCurrentNetwork()
  const { collection, error } = useCollection(tokenIds, network, collectionId, account)

  if (!collectionId) {
    return <></>
  }

  if (error) {
    return (
      <NavigationContainer
        leftButton={
          <BarBackButton
            onClick={() => navigate(routes.accountCollections())}
          />
        }
      >
        <H1 mt="4" textAlign="center">
          Error loading
        </H1>
      </NavigationContainer>
    )
  }

  return (
    <NavigationContainer
      leftButton={
        <BarBackButton onClick={() => navigate(routes.accountCollections())} />
      }
      scrollContent={
        <>
          <Image
            w="28px"
            h="28px"
            src={collection?.metadata.image}
            borderRadius="lg"
          />
          <H6>{collection?.metadata.name}</H6>
        </>
      }
    >
      {collection ? (
        <>
          <Flex
            gap="2"
            justifyContent="center"
            direction="column"
            alignItems="center"
          >
            <Image
              w="64px"
              h="64px"
              src={collection.metadata.image}
              backgroundColor={
                !collection.metadata.image ? "neutrals.300" : "transparent"
              }
              borderRadius="lg"
            />
            <H4>{collection?.metadata.name || "Loading..."}</H4>
          </Flex>
          <SimpleGrid
            gridTemplateColumns="repeat(auto-fill, 158px)"
            gap="3"
            mx="4"
            py={6}
          >
            {collection.nfts.map((nft) => (
              <NftFigure
                key={`${nft.collectionId}-${nft.id}`}
                onClick={() =>
                  navigate(
                    navigateToSend
                      ? routes.sendNft(nft.collectionId, nft.id)
                      : routes.accountNft(nft.collectionId, nft.id),
                  )
                }
              >
                <NftItem
                  thumbnailSrc={nft.metadata.image || ""}
                  name={
                    nft.metadata.name ||
                    "Untitled"
                  }
                />
              </NftFigure>
            ))}
          </SimpleGrid>
        </>
      ) : (
        <Spinner />
      )}
    </NavigationContainer>
  )
}
