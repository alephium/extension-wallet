import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { recoverBySeedPhrase } from "../../services/backgroundRecovery"
import { useBackupRequired } from "../recovery/backupDownload.state"
import {
  useSeedRecovery,
  validateAndSetPassword,
  validateSeedRecoveryCompletion,
} from "../recovery/seedRecovery.state"
import { OnboardingPasswordScreen } from "./OnboardingPasswordScreen"
import { useTranslation } from "react-i18next"

export const OnboardingRestorePassword: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <OnboardingPasswordScreen
      overrideTitle={t("New password")}
      overrideSubmitText={t("Continue")}
      overrideSubmit={async ({ password }) => {
        try {
          validateAndSetPassword(password)
          const state = useSeedRecovery.getState()
          if (validateSeedRecoveryCompletion(state)) {
            await recoverBySeedPhrase(state.seedPhrase, state.password)
            useBackupRequired.setState({ isBackupRequired: false }) // as the user recovered their seed, we can assume they have a backup
            navigate(routes.onboardingFinish.path, { replace: true })
          }
        } catch {
          console.error("seed phrase is invalid")
        }
      }}
    />
  )
}
