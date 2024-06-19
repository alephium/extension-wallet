import { FC, useEffect } from "react"
import styled from "styled-components"

import { useLoadingProgress } from "../../app.state"
import { Spinner } from "../../components/Spinner"
import { Greetings } from "../lock/Greetings"
import i18n from "../../../i18n"

const LoadingScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
`

const loadingTexts = [
  i18n.t("Loading…"),
  i18n.t("Please wait…"),
  i18n.t("Patience is a virtue…"),
  i18n.t("Almost there…"),
]

export interface LoadingScreenProps {
  texts?: string[]
}

export const LoadingScreen: FC<LoadingScreenProps> = ({ texts }) => {
  const { progress, clearProgress } = useLoadingProgress()

  // TODO: make clearProgress function stable
  // reset to 'indeterminate' spinner type on unmount
  useEffect(() => () => clearProgress(), []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LoadingScreenWrapper>
      <Spinner size={92} value={progress} />
      <Greetings greetings={texts || loadingTexts} />
    </LoadingScreenWrapper>
  )
}
