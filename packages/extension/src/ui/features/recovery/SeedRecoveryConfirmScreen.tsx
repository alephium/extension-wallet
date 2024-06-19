import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useReturnTo } from "../../routes"
import { P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { useBackupRequired } from "./backupDownload.state"
import { useTranslation } from "react-i18next"

export const SeedRecoveryConfirmScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  return (
    <DeprecatedConfirmScreen
      title={t("Have you written down your recovery phrase?")}
      switchButtonOrder
      rejectButtonText={t("No")}
      confirmButtonText={t("Yes")}
      onSubmit={() => {
        useBackupRequired.setState({ isBackupRequired: false })
        navigate(returnTo || routes.accountTokens())
      }}
      onReject={() => {
        navigate(-1)
      }}
    >
      <P>
        {t("If you lose your recovery phrase or someone steals it, you will lose access to your funds.")}
      </P>
    </DeprecatedConfirmScreen>
  )
}
