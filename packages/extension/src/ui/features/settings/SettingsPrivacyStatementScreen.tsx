import { BarBackButton, NavigationContainer } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import { PrivacyStatementText } from "../../components/PrivacyStatementText"
import { useTranslation } from "react-i18next"

export const SettingsPrivacyStatementScreen: FC = () => {
  const { t } = useTranslation()
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={t("Privacy Statement")}
    >
      <Flex direction="column" p="4">
        <PrivacyStatementText />
      </Flex>
    </NavigationContainer>
  )
}
