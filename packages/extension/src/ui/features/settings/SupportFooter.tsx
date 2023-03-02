import { Button, L2, P3, icons, logos } from "@argent/ui"
import { SimpleGrid, VStack } from "@chakra-ui/react"
import { FC } from "react"
import { Link } from "react-router-dom"

import { routes } from "../../routes"

const { SupportIcon } = icons
const { Discord, Github } = logos

const SupportFooter: FC = () => (
  <VStack mt={4} borderTop="solid 1px" borderTopColor="border">
    <P3 color="neutrals.400" pt="6">
      Help, support &amp; suggestions:
    </P3>
    <SimpleGrid columns={3} gap="2" w="100%" py={4}>
      <Button
        as={"a"}
        size="sm"
        rounded={"lg"}
        leftIcon={<SupportIcon />}
        href="https://alephium.org/discord"
        title="Get Alephium Support"
        target="_blank"
      >
        Help
      </Button>
      <Button
        as={"a"}
        size="sm"
        rounded={"lg"}
        leftIcon={<Discord />}
        href="https://alephium.org/discord"
        title="Ask a question on the dev-wallet channel on Discord"
        target="_blank"
      >
        Discord
      </Button>
      <Button
        as="a"
        size="sm"
        rounded={"lg"}
        leftIcon={<Github />}
        href="https://github.com/alephium/extension-wallet/issues"
        title="Post an issue on GitHub"
        target="_blank"
      >
        Github
      </Button>
    </SimpleGrid>
    <Link to={routes.settingsPrivacyStatement()}>
      <L2 color="neutrals.400" cursor="inherit" textDecoration="underline">
        Privacy Statement
      </L2>
    </Link>
    <L2 color="neutrals.500" py="2">
      Version: v{process.env.VERSION}
    </L2>
  </VStack>
)

export { SupportFooter }
