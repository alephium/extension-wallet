import { Button, H2, P3, P4, logos } from "@argent/ui"
import { Box, Flex, Text } from "@chakra-ui/react"
import { FC, useState } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { unlockedExtensionTracking } from "../../services/analytics"
import { startSession } from "../../services/backgroundSessions"
import { useActions } from "../actions/actions.state"
import { EXTENSION_IS_POPUP } from "../browser/constants"
import { recover } from "../recovery/recovery.service"
import { PasswordForm } from "./PasswordForm"
import { useTranslation } from "react-i18next"

const { AlephiumLogoLight } = logos

export const LockScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const actions = useActions()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  return (
    <Flex flex={1} flexDirection={"column"} py={6} px={5}>
      <Flex
        flex={1}
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        position="relative"
      >
        <P4
          as={Link}
          to={routes.reset()}
          color="neutrals.300"
          position="absolute"
          right={0}
          top={0}
        >
          {t("Reset")}
        </P4>
        <Text pt={18} fontSize="10xl">
          <AlephiumLogoLight />
        </Text>
        <Box mt="8" mb="8" width="100%">
          <H2>{t("Welcome back")}</H2>
          <P3 color="neutrals.300">{t("Unlock your wallet to continue")}</P3>
        </Box>

        <Box width="100%">
          <PasswordForm
            verifyPassword={async (password) => {
              setIsLoading(true)
              try {
                await startSession(password)
                unlockedExtensionTracking()
                const target = await recover()

                // If only called by dapp (in popup) because the wallet was locked, but the dapp is already whitelisted/no transactions requested (actions=0), then close
                if (EXTENSION_IS_POPUP && !actions.length) {
                  window.close()
                }

                navigate(target)
                return true
              } catch {
                useAppState.setState({
                  error: t("Incorrect password"),
                })
                return false
              } finally {
                setIsLoading(false)
              }
            }}
          >
            {({ isDirty, isSubmitting }) => (
              <Flex position={"absolute"} left={0} bottom={0} right={0}>
                <Button
                  gap="2"
                  colorScheme="primary"
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  width="100%"
                  isLoading={isLoading}
                  loadingText={t("Unlocking")}
                >
                  {t("Unlock")}
                </Button>
              </Flex>
            )}
          </PasswordForm>
        </Box>
      </Flex>
    </Flex>
  )
}
