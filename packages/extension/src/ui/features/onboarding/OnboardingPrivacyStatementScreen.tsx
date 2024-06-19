import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { PrivacyStatementText } from "../../components/PrivacyStatementText"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { useTranslation } from "react-i18next"

const PrivacyStatementTextContainer = styled.div`
  margin-bottom: 32px;
`

export const OnboardingPrivacyStatementScreen: FC = () => {
  const { t } = useTranslation()
  const naviagte = useNavigate()
  return (
    <OnboardingScreen back title={t("Privacy Statement")}>
      <PrivacyStatementTextContainer>
        <PrivacyStatementText />
      </PrivacyStatementTextContainer>
      <OnboardingButton onClick={() => naviagte(-1)}>{t("Back")}</OnboardingButton>
    </OnboardingScreen>
  )
}
