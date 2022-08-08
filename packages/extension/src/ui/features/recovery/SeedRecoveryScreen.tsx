import { FC, useMemo, useRef, useState } from "react"

import { IconBar } from "../../components/IconBar"
import { TextArea } from "../../components/InputText"
import { routes } from "../../routes"
import { FormError, P } from "../../theme/Typography"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { validateAndSetSeedPhrase } from "./seedRecovery.state"
import { useCustomNavigate } from "./useCustomNavigate"

export const SeedRecoveryScreen: FC = () => {
  const textAreaElement = useRef<HTMLTextAreaElement>(null)
  const [seedPhraseInput, setSeedPhraseInput] = useState("")
  const [error, setError] = useState("")
  const customNavigate = useCustomNavigate()

  const disableSubmit = useMemo(
    () => Boolean(!seedPhraseInput || error),
    [seedPhraseInput, error],
  )
  const handleRestoreClick = async () => {
    try {
      validateAndSetSeedPhrase(seedPhraseInput)
      if (textAreaElement.current !== null) {
        textAreaElement.current.value = ""
      }
      customNavigate(routes.seedRecoveryPassword())
    } catch {
      setError("Invalid seed phrase")
    }
  }

  return (
    <>
      <IconBar back />
      <ConfirmScreen
        title="Restore wallet"
        confirmButtonText="Continue"
        singleButton
        confirmButtonDisabled={disableSubmit}
        onSubmit={handleRestoreClick}
        smallTopPadding
      >
        <P>
          Enter each of the 24 words from your recovery phrase separated by a
          space
        </P>
        <TextArea
          ref={textAreaElement}
          placeholder="Enter the 24 words"
          value={seedPhraseInput}
          onChange={(e: any) => {
            setError("")
            setSeedPhraseInput(e.target.value)
          }}
          style={{
            margin: "40px 0 8px",
          }}
          autoComplete="off"
        />
        {error && <FormError>{error}</FormError>}
      </ConfirmScreen>
    </>
  )
}
