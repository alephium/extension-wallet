import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { coerceErrorToString } from "../../../shared/utils/error"
import { useAppState } from "../../app.state"
import { P } from "../../theme/Typography"
import { EXTENSION_IS_POPUP } from "../browser/constants"
import { Pre } from "./ApproveSignatureScreen"
import { DeprecatedConfirmScreen } from "./DeprecatedConfirmScreen"
import { useTranslation } from "react-i18next"

const SP = styled(P)`
  font-size: 18px;
  line-height: 24px;
`

const WrappingPre = styled(Pre)`
  white-space: pre-wrap;
`

export const ErrorScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { error } = useAppState()
  const displayError = coerceErrorToString(error)

  const message =
    error && error.replace ? error.replace(/^(error:\s*)+/gi, "") : displayError

  const onSubmit = () => {
    if (EXTENSION_IS_POPUP) {
      window.close()
    } else {
      navigate(-1)
    }
  }

  return (
    <DeprecatedConfirmScreen
      title="Error"
      confirmButtonText={EXTENSION_IS_POPUP ? "Close" : "Back"}
      singleButton
      onSubmit={onSubmit}
    >
      <SP>{t("Something went wrong")}:</SP>
      <WrappingPre>{message}</WrappingPre>
    </DeprecatedConfirmScreen>
  )
}
