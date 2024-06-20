import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "styled-components"

import { routes } from "../../routes"
import { resetAll } from "../../services/background"
import { P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { useTranslation } from "react-i18next"

export const ResetScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <DeprecatedConfirmScreen
      title="Reset wallet"
      confirmButtonText="RESET"
      confirmButtonBackgroundColor={theme.red1}
      rejectButtonText="Cancel"
      onSubmit={() => {
        resetAll()
        localStorage.clear()
        navigate(routes.onboardingStart())
      }}
    >
      <P>
        {t("If you reset your wallet, the only way to recover it is with your seed phrase. Make sure to back it up from the settings and save it somewhere securely before resetting the extension")}
      </P>
    </DeprecatedConfirmScreen>
  )
}
