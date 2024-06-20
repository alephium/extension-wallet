import {
  B3,
  BarBackButton,
  BarCloseButton,
  Button,
  CellStack,
  H5,
  NavigationContainer,
  P4,
  icons,
} from "@argent/ui"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Image,
  SimpleGrid,
  Text
} from "@chakra-ui/react"
import { FC } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { Schema, object } from "yup"

import { routes } from "../../routes"
import { addressSchema } from "../../services/addresses"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenMenu } from "../accountTokens/TokenMenu"
import { useCurrentNetwork } from "../networks/useNetworks"
import { useNFT } from "./useNfts"
import { useTranslation } from "react-i18next"
const { SwapIcon } = icons

const { SendIcon } = icons

export interface SendNftInput {
  recipient: string
}
export const SendNftSchema: Schema<SendNftInput> = object().required().shape({
  recipient: addressSchema,
})

export const NftScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { contractAddress, tokenId } = useParams()
  const account = useSelectedAccount()
  const network = useCurrentNetwork()
  const { nft } = useNFT(network, contractAddress, tokenId, account)

  if (!account || !contractAddress || !tokenId) {
    return <Navigate to={routes.accounts()} />
  }

  if (!nft) {
    return (
      <NavigationContainer
        leftButton={
          <BarBackButton
            onClick={() => navigate(routes.accountCollections())}
          />
        }
        title={t("Not found")}
      />
    )
  }

  return (
    <>
      <NavigationContainer
        isAbsolute
        leftButton={<BarCloseButton />}
        rightButton={
          <TokenMenu tokenId={nft.id} canHideToken={false} />
        }
      >
        <>
          <Box
            pt="18"
            px="10"
            position="relative"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              backgroundImage={nft.metadata.image}
              backgroundPosition="center"
              backgroundSize="cover"
              backgroundRepeat="no-repeat"
              style={{ filter: "blur(150px)" }}
              position="absolute"
              top="20%"
              left="0"
              right="0"
              bottom="25%"
            />
            <Image
              position="relative"
              border="solid 2px"
              borderColor="transparent"
              borderRadius="lg"
              alt={nft.metadata.name}
              src={nft.metadata.image}
            />
          </Box>
          <H5 py="6" textAlign="center">
            {nft.metadata.name}
          </H5>
        </>

        <CellStack pb="18">
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton justifyContent="space-between">
                <P4 color="neutrals.300">{t("Description")}</P4> <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>{nft.metadata.description}</AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CellStack>
        <SimpleGrid
          bg="neutrals.900"
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          px="4"
          py="3"
          gap="2"
          columns={1}
          borderTop="solid 1px"
          borderColor="neutrals.800"
        >
          <Button
            w="100%"
            type="button"
            onClick={() => navigate(routes.sendToken(tokenId))}
            leftIcon={<SendIcon />}
            bg="neutrals.700"
            _hover={{ bg: "neutrals.600" }}
          >
            <B3>{t("Send")}</B3>
          </Button>
        </SimpleGrid>
      </NavigationContainer>
    </>
  )
}

export function NoNft() {
  const { t } = useTranslation()
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      color="neutrals.500"
      flex="1"
      mx="14"
    >
      <Text fontSize="40">
        <SwapIcon />
      </Text>
      <H5 mt="10" textAlign="center">
        {t("NFT is not available for now")}
      </H5>
    </Flex>
  )
}
