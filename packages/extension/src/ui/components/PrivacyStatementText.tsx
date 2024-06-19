import { FC } from "react"
import styled from "styled-components"

import { A } from "../theme/Typography"
import { Trans, useTranslation } from "react-i18next"

const Container = styled.span`
  font-size: 16px;
  line-height: 21px;
  > ${A} {
    padding: 0;
  }
`

export const PrivacyStatementText: FC = () => {
  const { t } = useTranslation()
  return (
    <Container>
      <Trans
        t={t}
        i18nKey="privacyStatement"
        components={{
          1: <span style={{ fontWeight: "bold" }} />,
        }}
      >
        {'The browser extension wallet&nbsp;<1>does not collect any personal information&nbsp;</1>nor does it correlate any of your personal information with anonymous data processed as part of its services.'}
      </Trans>
    </Container>
  )
}
