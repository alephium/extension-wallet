import { FC, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import {
  AccountBalanceWalletIcon,
  RefreshIcon,
} from "../../components/Icons/MuiIcons"
import Row from "../../components/Row"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { extensionIsInTab, openExtensionInTab } from "../browser/tabs"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import {
  CreateWalletRectButtonIcon,
  RectButton,
  RestoreWalletRectButtonIcon,
} from "./ui/RectButton"

export const OnboardingStartScreen: FC = () => {
  const didRunInit = useRef(false)
  const navigate = useNavigate()
  usePageTracking("welcome")
  const { t } = useTranslation()

  useEffect(() => {
    const init = async () => {
      /** prevent opening more than once when useEffect is called multiple times in dev */
      if (!didRunInit.current) {
        didRunInit.current = true
        /** When user clicks extension icon, open onboarding in full screen */
        const inTab = await extensionIsInTab()
        if (!inTab) {
          /** Note: cannot detect and focus an existing extension tab here, so open a new one */
          await openExtensionInTab()
          window.close()
        }
      }
    }
    init()
  }, [])

  return (
    <OnboardingScreen
      length={4}
      currentIndex={0}
      title={t("Welcome to Alephium")}
      subtitle={t("A New Paradigm")}
    >
      <Row gap={"12px"} align="stretch">
        <RectButton onClick={() => navigate(routes.onboardingPassword())}>
          <CreateWalletRectButtonIcon>
            <AccountBalanceWalletIcon />
          </CreateWalletRectButtonIcon>
          {t("Create a new wallet")}
        </RectButton>
        <RectButton onClick={() => navigate(routes.onboardingRestoreSeed())}>
          <RestoreWalletRectButtonIcon>
            <RefreshIcon />
          </RestoreWalletRectButtonIcon>
          {t("Restore an existing wallet")}
        </RectButton>
      </Row>
    </OnboardingScreen>
  )
}
