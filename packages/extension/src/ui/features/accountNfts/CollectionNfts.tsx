import { BarBackButton, H1, H4, H6, NavigationContainer } from "@argent/ui"
import { Flex, Image, SimpleGrid, Spinner as Loading } from "@chakra-ui/react"
import { ErrorBoundary } from "@sentry/react"
import { FC, Suspense } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { Nft } from "./NFT"
import { NftFigure } from "./NftFigure"
import { useNFTCollection } from "./useNFTCollections"
import { useTranslation } from "react-i18next"
import { isMp4Url } from "./alephium-nft.service"

export const CollectionNfts: FC = () => {
  const { t } = useTranslation()
  const { collectionId } = useParams<{ collectionId: string }>()
  const account = useSelectedAccount()
  const navigate = useNavigate()
  const network = useCurrentNetwork()
  const { collection, error } = useNFTCollection(network, collectionId, account)

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
          {t("Error loading")}
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
          {collection?.metadata.image && isMp4Url(collection.metadata.image) ? (
            <video
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                objectFit: 'cover'
              }}
              src={collection.metadata.image}
              muted
              playsInline
              loop
              autoPlay = {false}
            />
          ) : (
            <Image
              w="28px"
              h="28px"
              src={collection?.metadata.image}
              borderRadius="lg"
            />
          )}
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
              <H4>{collection?.metadata.name || `${t('Loading')}...`}</H4>
            </Flex>
          </Flex>

          <SimpleGrid
            gridTemplateColumns="repeat(auto-fill, 158px)"
            gap="3"
            mx="3"
            py={6}
          >
            {collection.nftIds.map((nftId) => (
              <NftFigure key={`${collectionId}-${nftId}`}>
                <ErrorBoundary fallback={<H4 mt="10" textAlign="center">{t("Deprecated NFT")}</H4>}>
                  <Suspense fallback={
                    <Flex w="142px" h="142px" justifyContent="center" alignItems="center">
                      <Loading />
                    </Flex>}
                  >
                    <Nft
                      collectionId={collectionId}
                      nftId={nftId}
                      network={network}
                      account={account}
                    />
                  </Suspense>
                </ErrorBoundary>
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
