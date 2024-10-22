import { FC, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { ContentWrapper } from "../../components/FullScreenPage"
import { Title } from "../../components/Page"
import { Spinner } from "../../components/Spinner"
import { StepIndicator } from "../../components/StepIndicator"
import { routes } from "../../routes"
import { A, FormError } from "../../theme/Typography"
import { BlackCircle } from "./assets/BlackCircle"
import { LedgerStartIllustration } from "./assets/LedgerStart"
import { LedgerPage } from "./LedgerPage"
import { Steps } from "./Steps"
import { LedgerAlephium } from "./utils"
import { addLedgerAccount } from "../accounts/useAddAccount"
import { useTranslation } from "react-i18next"

export const StyledButton = styled(Button)`
  width: fit-content;
  padding-left: 32px;
  padding-right: 32px;
  margin: 8px auto 0;
`

export const LedgerStartScreen: FC = () => {
  const { t } = useTranslation()
  const { networkId, group, keyType } = useParams()
  const [addressGroup, setAddressGroup] = useState<number>()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    if (group === undefined || group === 'undefined') {
      setAddressGroup(undefined)
    } else {
      setAddressGroup(parseInt(group))
    }
  }, [group])

  if (networkId === undefined) {
    return <></>
  }

  {return (
    <LedgerPage>
      {detecting ? (
        <BlackCircle>
          <Spinner size={64} />
        </BlackCircle>
      ) : (
        <LedgerStartIllustration />
      )}
      <ContentWrapper>
        <StepIndicator length={2} currentIndex={0} />
        <Title style={{ margin: "32px 0" }}>
          {detecting ? `${t("Detecting Ledger")}...` : t("Connect a new Ledger")}
        </Title>
        <Steps
          steps={[
            { title: t("Plug in and unlock your Ledger device") },
            {
              title: t("Open (or install) the Alephium Ledger app"),
              description: <>{t("The Alephium app can be installed via Ledger Live.")} <A href="https://docs.alephium.org/wallet/ledger" target="_blank">{t("More information here.")}</A></>,
            },
          ]}
          style={{ marginBottom: 8 }}
        />
        {error && <FormError>{error}</FormError>}
        <StyledButton
          style={{ marginTop: 32 }}
          onClick={async () => {
            setError("")

            if (keyType === "bip340-schnorr") {
              setError(t("Schnorr is not supported for Alephium's ledger app yet"))
              return
            }

            setDetecting(true)
            try {
              const account = await LedgerAlephium
                .create()
                .then((ledger) => ledger.createNewAccount(networkId, addressGroup, keyType ?? "default"))
              addLedgerAccount(account)
              navigate(routes.ledgerDone())
            } catch (e) {
              console.error(e)
              if (e instanceof Error) {
                setError(t("Alephium Ledger app is not connected, please follow the instructions above"))
              }
            }

            setDetecting(false)
          }}
          variant="primary"
          disabled={detecting}
        >
          {t("Continue")}
        </StyledButton>
      </ContentWrapper>
    </LedgerPage>
  )}
}
