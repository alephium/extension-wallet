import { BarBackButton, H1, H4, H6, NavigationContainer } from "@argent/ui"
import { Tooltip, Flex, Image, SimpleGrid } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { WarningIconRounded } from "../../components/Icons/WarningIconRounded"

import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useNonFungibleTokensWithBalance } from "../accountTokens/tokens.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { NftFigure } from "./NftFigure"
import { NftItem } from "./NftItem"
import { useNFTCollection } from "./useNFTCollections"

export const CollectionNfts: FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const unknownTokens = useNonFungibleTokensWithBalance(account)
  const unknownTokenIds = unknownTokens.map((t) => t.id)
  const network = useCurrentNetwork()
  const { collection, error } = useNFTCollection(unknownTokenIds, network, collectionId, account)

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
            <Flex
              gap="1"
              justifyContent="center"
              alignItems="center"
            >

              <H4>{collection?.metadata.name || "Loading..."}</H4>
              {!collection.verified && (
                <>
                  <Tooltip label={"Unverified Collection"} shouldWrapChildren={true}>
                    <WarningIconRounded width={16} height={16} style={{ marginBottom: '12px', paddingLeft: 0 }} />
                  </Tooltip>
                </>
              )}
            </Flex>
          </Flex>

          <SimpleGrid
            gridTemplateColumns="repeat(auto-fill, 158px)"
            gap="3"
            mx="3"
            py={6}
          >
            {collection.nfts.map((nft) => (
              <NftFigure
                key={`${nft.collectionId}-${nft.id}`}
                onClick={() =>
                  navigate(routes.sendNft(nft.collectionId, nft.id))
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
