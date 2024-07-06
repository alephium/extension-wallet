import { FC } from "react"
import styled from "styled-components"

import { ContentWrapper } from "../../components/FullScreenPage"
import { Title } from "../../components/Page"
import { StepIndicator } from "../../components/StepIndicator"
import { P } from "../../theme/Typography"
import { LedgerPage } from "./LedgerPage"
import { StyledButton } from "./start"
import { LedgerStartIllustration } from "./assets/LedgerStart"
import { useTranslation } from "react-i18next"

const SP = styled(P)`
  font-weight: 400;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 32px;
`

export const LedgerDoneScreen: FC = () => {
  const { t } = useTranslation()
  return (
    <LedgerPage>
      <LedgerStartIllustration />
      <ContentWrapper>
        <StepIndicator length={2} currentIndex={1} />

        <Title style={{ margin: "32px 0" }}>{t("Account added")}</Title>

        <SP>
          {t("Your Ledger account has been successfully imported. Enjoy secure self-custody.")}
        </SP>

        <StyledButton
          onClick={async () => {
            window.close()
          }}
          variant="primary"
        >
          {t("Finish")}
        </StyledButton>
      </ContentWrapper>
    </LedgerPage>
  )
}
