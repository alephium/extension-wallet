import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { FC, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../../components/Button"
import { Paragraph } from "../../components/Page"
import { useReturnTo } from "../../routes"
import { checkPassword } from "../../services/backgroundSessions"
import { StickyGroup } from "../actions/DeprecatedConfirmScreen"
import { PasswordForm } from "../lock/PasswordForm"
import { CopySeedPhrase } from "../recovery/CopySeedPhrase"
import { SeedPhrase } from "../recovery/SeedPhrase"
import { useSeedPhrase } from "../recovery/useSeedPhrase"
import { useTranslation } from "react-i18next"

const CopySeedScreen: FC = () => {
  const { t } = useTranslation()
  const seedPhrase = useSeedPhrase()
  return (
    <>
      <Paragraph>
        {t("Write these words down on paper. It is unsafe to save them on your computer.")}
      </Paragraph>
      <SeedPhrase seedPhrase={seedPhrase} />
      <CopySeedPhrase seedPhrase={seedPhrase} />
    </>
  )
}

const UnlockCopySeed: FC<{
  setPasswordIsValid: (isValid: boolean) => void
}> = ({ setPasswordIsValid }) => {
  const { t } = useTranslation()
  return (
    <>
      <Paragraph>{t("Enter your password to view your recovery phrase.")}</Paragraph>

      <PasswordForm
        verifyPassword={async (password) => {
          const isValid = await checkPassword(password)
          setPasswordIsValid(isValid)
          return isValid
        }}
      >
        {(isDirty) => (
          <StickyGroup>
            <Button type="submit" disabled={!isDirty}>
              {t("Continue")}
            </Button>
          </StickyGroup>
        )}
      </PasswordForm>
    </>
  )
}

export const SeedSettingsScreen: FC = () => {
  const { t } = useTranslation()
  const [passwordIsValid, setPasswordIsValid] = useState(false)
  const returnTo = useReturnTo()
  const navigate = useNavigate()

  const onClick = useCallback(() => {
    if (returnTo) {
      navigate(returnTo)
    } else {
      navigate(-1)
    }
  }, [navigate, returnTo])

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onClick} />}
      title={t("View recovery phrase")}
    >
      <CellStack>
        {!passwordIsValid && (
          <UnlockCopySeed setPasswordIsValid={setPasswordIsValid} />
        )}
        {passwordIsValid && <CopySeedScreen />}
      </CellStack>
    </NavigationContainer>
  )
}
