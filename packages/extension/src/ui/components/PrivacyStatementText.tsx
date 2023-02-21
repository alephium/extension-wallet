import { FC } from "react"
import styled from "styled-components"

import { A } from "../theme/Typography"

const Container = styled.span`
  font-size: 16px;
  line-height: 21px;
  > ${A} {
    padding: 0;
  }
`

export const PrivacyStatementText: FC = () => {
  return (
    <Container>
      The browser extension wallet&nbsp;
      <span style={{ fontWeight: "bold" }}>
        does not collect any personal information&nbsp;
      </span>
      nor does it correlate any of your personal information with anonymous data
      processed as part of its services.
    </Container>
  )
}
