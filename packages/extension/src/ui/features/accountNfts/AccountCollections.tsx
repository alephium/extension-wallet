import { H4 } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC, Suspense } from "react"

import { Account } from "../accounts/Account"
import { EmptyCollections } from "./EmptyCollections"
import { NftFigure } from "./NftFigure"
import { useCollectionAndNFTs } from "./useNFTCollections"
import { useNetwork } from "../networks/useNetworks"
import { Spinner } from "../../components/Spinner"
import { NftCollectionItem } from "./NftCollectionItem"
import { useTranslation } from "react-i18next"

interface AccountCollectionsProps {
  account: Account
  withHeader?: boolean
  navigateToSend?: boolean
}

const Collections: FC<AccountCollectionsProps> = ({
  account,
  navigateToSend = false,
}) => {
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
            <NftFigure key={collectionId}>
              <NftCollectionItem
                collectionId={collectionId}
                network={network}
                account={account}
                navigateToSend={navigateToSend}
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
  const { t } = useTranslation()
  return (
    <>
      {withHeader && <H4 textAlign="center">{t("NFTs")}</H4>}
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
