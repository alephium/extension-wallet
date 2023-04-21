import { FC, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { Button } from "../../components/Button"
import { ContentWrapper } from "../../components/FullScreenPage"
import { Title } from "../../components/Page"
import { Spinner } from "../../components/Spinner"
import { StepIndicator } from "../../components/StepIndicator"
import { routes } from "../../routes"
import { FormError } from "../../theme/Typography"
import { BlackCircle } from "./assets/BlackCircle"
import { LedgerStartIllustration } from "./assets/LedgerStart"
import { LedgerPage } from "./LedgerPage"
import { Steps } from "./Steps"
import { deriveAccount } from "./utils"
import { addLedgerAccount, getAllLedgerAccounts } from "../accounts/useAddAccount"

export const StyledButton = styled(Button)`
  width: fit-content;
  padding-left: 32px;
  padding-right: 32px;
  margin: 8px auto 0;
`

export const LedgerStartScreen: FC = () => {
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
          {detecting ? "Detecting Ledger..." : "Connect a new Ledger"}
        </Title>
        <Steps
          steps={[
            { title: "Plug in and unlock your Ledger device" },
            {
              title: "Open (or install) the StarkNet app",
              description: "The StarkNet app can be installed via Ledger Live",
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
              setError("Schnorr is not supported for Alephium's ledger app yet")
              return
            }

            setDetecting(true)
            try {
              const ledgerAccounts = await getAllLedgerAccounts(networkId)
              const [account, hdIndex] = await deriveAccount(ledgerAccounts, addressGroup, keyType ?? "default")
              addLedgerAccount(networkId, account, hdIndex)
              navigate(routes.ledgerDone())
            } catch (e) {
              console.error(e)
              if (e instanceof Error) {
                setError(e.message)
              }
            }

            // setDetecting(false)
          }}
          variant="primary"
          disabled={detecting}
        >
          Continue
        </StyledButton>
      </ContentWrapper>
    </LedgerPage>
  )}
}
