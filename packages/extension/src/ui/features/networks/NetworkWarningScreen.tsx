import { H3, P3, icons } from "@argent/ui"
import { Button, Center, Circle, Text } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useReturnTo } from "../../routes"
import { useNeedsToShowNetworkStatusWarning } from "./seenNetworkStatusWarning.state"
import { useCurrentNetwork } from "./useNetworks"
import { useTranslation } from "react-i18next"

const { NetworkIcon } = icons

export const NetworkWarningScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const network = useCurrentNetwork()
  const [, updateNeedsToShowNetworkStatusWarning] =
    useNeedsToShowNetworkStatusWarning()

  return (
    <Center flex={1} flexDirection={"column"} py={6} px={5}>
      <Center flex={1} flexDirection={"column"} textAlign={"center"}>
        <Circle backgroundColor={"panel"} size={24} position="relative">
          <Text fontSize={"6xl"}>
            <NetworkIcon />
          </Text>
          <Circle
            position={"absolute"}
            right={1}
            bottom={1}
            size={5}
            bg={"warning.500"}
            border={"4px"}
            borderColor="neutrals.900"
          />
        </Circle>
        <H3 pt={6} pb={3}>
          {t("Network issues")}
        </H3>
        <P3 color="neutrals.100">
          {t("There are connectivity issues for Alephium explorer or full node at the moment on {{ network }}", { network: network.name })}
        </P3>
      </Center>
      <Button
        mt={6}
        width={["100%", "initial"]}
        colorScheme="primary"
        onClick={() => {
          updateNeedsToShowNetworkStatusWarning()
          navigate(returnTo ? returnTo : routes.accounts())
        }}
      >
        {t("I understand")}
      </Button>
    </Center>
  )
}
