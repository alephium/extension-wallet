import { AlertButton, icons } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { useTranslation } from "react-i18next"

const { LockIcon } = icons

export const RecoveryBanner: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()
  return (
    <AlertButton
      colorScheme={"warning"}
      title={t("Set up account recovery")}
      description={t("Click here to secure your assets")}
      size="lg"
      icon={<LockIcon />}
      onClick={() => {
        navigate(routes.setupSeedRecovery(returnTo))
      }}
    />
  )
}
