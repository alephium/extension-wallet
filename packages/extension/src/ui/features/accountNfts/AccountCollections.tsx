import { H4 } from "@argent/ui"
import { Flex, SimpleGrid } from "@chakra-ui/react"
import { FC, Suspense } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { Account } from "../accounts/Account"
import { useTokensWithBalance } from "../accountTokens/tokens.state"
import { EmptyCollections } from "./EmptyCollections"
import { NftFigure } from "./NftFigure"
import { NftItem } from "./NftItem"
import { useCollections } from "./useCollections"
import { useNetwork } from "../networks/useNetworks"
import { Spinner } from "../../components/Spinner"

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
  const tokensWithBalances = useTokensWithBalance(account)
  const tokenIds = tokensWithBalances.tokenDetails.map((token) => token.id)
  const network = useNetwork(account.networkId)
  const { collections } = useCollections(tokenIds, network, account)

  return (
    <>
      {collections.length === 0 && (
        <EmptyCollections networkId={account.networkId} />
      )}

      {collections.length > 0 && (
        <SimpleGrid
          gridTemplateColumns="repeat(auto-fill, 158px)"
          gap="3"
          py={4}
          mx="4"
        >
          {collections.map((collection) => (
            <NftFigure
              key={collection.id}
              onClick={() => {
                navigate(routes.collectionNfts(collection.id), {
                  state: { navigateToSend },
                })
              }}
            >
              <NftItem
                name={collection.metadata.name}
                thumbnailSrc={collection.metadata.image}
                total={collection.nfts.length}
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
