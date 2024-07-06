import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../../routes"
import { upgradeAccount } from "../../services/backgroundAccounts"
import { P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { useSelectedAccount } from "./accounts.state"
import { useTranslation } from "react-i18next"

const StyledP = styled(P)`
  margin-bottom: 16px;
  line-height: 1.5em;
`

export const UpgradeScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const selectedAccount = useSelectedAccount()

  // If no account is selected, navigate to the account list screen. Dont show anything while doing so.
  useEffect(() => {
    if (!selectedAccount) {
      navigate(routes.accounts())
    }
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedAccount) {
    return <></>
  }

  return (
    <DeprecatedConfirmScreen
      title={t("Upgrade Wallet")}
      confirmButtonText={t("Upgrade")}
      rejectButtonText={t("Cancel")}
      onSubmit={async () => {
        await upgradeAccount(selectedAccount)
        navigate(routes.accountTokens())
      }}
      onReject={() => {
        navigate(routes.accountTokens())
      }}
    >
      <StyledP>
        {t("You will upgrade your wallet implementation to use the latest features and security.")}
      </StyledP>
      <StyledP>
        {t("This upgrade is required due to network and account contract changes. We expect these kind of upgrades to be less frequent as the network matures.")}
      </StyledP>
    </DeprecatedConfirmScreen>
  )
}
