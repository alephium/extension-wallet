import { FC } from "react"
import styled from "styled-components"

import { ContentWrapper } from "../../components/FullScreenPage"
import { Title } from "../../components/Page"
import { StepIndicator } from "../../components/StepIndicator"
import { P } from "../../theme/Typography"
import { LedgerPage } from "./LedgerPage"
import { StyledButton } from "./start"
import { LedgerStartIllustration } from "./assets/LedgerStart"

const SP = styled(P)`
  font-weight: 400;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 32px;
`

export const LedgerDoneScreen: FC = () => {
  return (
    <LedgerPage>
      <LedgerStartIllustration />
      <ContentWrapper>
        <StepIndicator length={2} currentIndex={1} />

        <Title style={{ margin: "32px 0" }}>Account added</Title>

        <SP>
          Your Ledger account has been successfully imported. Enjoy secure self-custody.
        </SP>

        <StyledButton
          onClick={async () => {
            window.close()
          }}
          variant="primary"
        >
          Finish
        </StyledButton>
      </ContentWrapper>
    </LedgerPage>
  )
}
