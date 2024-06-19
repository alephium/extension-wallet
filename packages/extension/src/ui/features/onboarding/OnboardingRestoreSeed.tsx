import { SeedInput } from "@argent/ui"
import { FC, useMemo, useState } from "react"
import styled from "styled-components"

import { RowBetween } from "../../components/Row"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { FormError } from "../../theme/Typography"
import { validateAndSetSeedPhrase } from "../recovery/seedRecovery.state"
import { useCustomNavigate } from "../recovery/useCustomNavigate"
import { StatusMessageBanner } from "../statusMessage/StatusMessageBanner"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { useTranslation } from "react-i18next"

const RestoreBackupLink = styled.span`
  padding: 0;
  color: ${({ theme }) => theme.text3};
  font-weight: 400;
  font-size: 12px;
  text-decoration-line: underline;
  cursor: pointer;
`

export const OnboardingRestoreSeed: FC = () => {
  const { t } = useTranslation()
  usePageTracking("restoreWallet")
  const [seedPhraseInput, setSeedPhraseInput] = useState("")
  const [error, setError] = useState("")
  const customNavigate = useCustomNavigate()

  const disableSubmit = useMemo(
    () => Boolean(!seedPhraseInput || error),
    [seedPhraseInput, error],
  )
  const handleRestoreClick = async () => {
    try {
      validateAndSetSeedPhrase(seedPhraseInput.trim())
      customNavigate(routes.onboardingRestorePassword())
    } catch {
      setError(t("Invalid seed phrase"))
    }
  }

  return (
    <OnboardingScreen
      back
      length={4}
      currentIndex={1}
      title={t("Restore accounts")}
      subtitle={t("Enter your recovery phrase (upto 24 words) separated by a space.")}
    >
      <SeedInput
        mb="1"
        onChange={(seed) => {
          setError("")
          setSeedPhraseInput(seed)
        }}
      />
      {error && <FormError>{error}</FormError>}

      <StatusMessageBanner
        extendable={false}
        statusMessage={{
          message: t("Never shown"),
          dismissable: false,
          summary:
            t("You can paste your recovery phrase at once, but typing the words individually is safer"),
          level: "warn",
        }}
        onDismiss={() => {
          // not possible
        }}
        style={{
          marginTop: "32px",
          width: "100%",
        }}
      />

      <RowBetween style={{ paddingTop: "32px" }}>
        <OnboardingButton onClick={handleRestoreClick} disabled={disableSubmit}>
          {t("Continue")}
        </OnboardingButton>
        <RestoreBackupLink
          onClick={() => {
            customNavigate(routes.onboardingRestoreBackup())
          }}
        >
          {t("Recover using a backup file")}
        </RestoreBackupLink>
      </RowBetween>
    </OnboardingScreen>
  )
}
