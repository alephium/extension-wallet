import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { VStack } from "@chakra-ui/react"
import { uniq } from "lodash-es"
import { FC, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import {
  removePreAuthorization,
  resetPreAuthorizations,
  usePreAuthorizations,
} from "../../../shared/preAuthorizations"
import { Button } from "../../components/Button"
import { P } from "../../theme/Typography"
import { DappConnection } from "./DappConnection"
import { useTranslation } from "react-i18next"

export const DappConnectionsSettingsScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const preAuthorizations = usePreAuthorizations()

  const preauthorizedHosts = useMemo<string[]>(() => {
    return uniq(
      preAuthorizations.map((preAuthorization) => preAuthorization.host),
    )
  }, [preAuthorizations])

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={t("dApp connections")}
    >
      <VStack gap="6">
        {preauthorizedHosts === null ? null : preauthorizedHosts.length ===
          0 ? (
          <P>{t("You haven&apos;t connected to any dApp yet.")}</P>
        ) : (
          <CellStack gap="4">
            {preauthorizedHosts.map((host) => (
              <DappConnection
                key={host}
                host={host}
                onRemoveClick={async () => {
                  /** passing null as accountAddress will remove all accounts */
                  await removePreAuthorization(host)
                }}
              />
            ))}

            <P>{t("Require all dApps to request a new connection to your wallet?")}</P>
            <Button
              onClick={() => {
                resetPreAuthorizations()
                navigate(-1)
              }}
            >
              {t("Reset all dApp connections")}
            </Button>
          </CellStack>
        )}
      </VStack>
    </NavigationContainer>
  )
}
