import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Network } from "../../../shared/networks"
import { BackButton } from "../../components/BackButton"
import { Button, ButtonGroupVertical } from "../../components/Button"
import { Header } from "../../components/Header"
import { InputText } from "../../components/InputText"
import { routes } from "../../routes"
import { addNetworks } from "../../services/backgroundNetworks"
import { FormError, H2 } from "../../theme/Typography"
import { useNetworkState } from "../networks/networks.state"
import { useNetworks } from "../networks/useNetworks"
import { recover } from "../recovery/recovery.service"

const AddTokenScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 32px 48px 32px;

  > form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  ${Button} {
    margin-top: 64px;
  }
`

interface AddNetworkScreenProps {
  requestedNetwork: Network
  hideBackButton?: boolean
  onSubmit?: () => void
  onReject?: () => void
  mode?: "add" | "switch"
}

export const AddNetworkScreen: FC<AddNetworkScreenProps> = ({
  requestedNetwork,
  hideBackButton,
  onSubmit,
  onReject,
  mode = "add",
}) => {
  const navigate = useNavigate()
  const { allNetworks } = useNetworks({ suspense: false })

  const { setSwitcherNetworkId } = useNetworkState()
  const [error, setError] = useState("")

  return (
    <>
      <Header hide={hideBackButton}>
        <BackButton />
      </Header>

      <AddTokenScreenWrapper>
        <H2>{mode === "add" ? "Add" : "Switch"} Network</H2>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (requestedNetwork) {
              try {
                if (mode === "add") {
                  addNetworks([requestedNetwork])
                  onSubmit?.()
                  navigate(await recover())
                } else if (mode === "switch") {
                  onSubmit?.()
                  if (allNetworks?.some((n) => n.id === requestedNetwork.id)) {
                    setSwitcherNetworkId(requestedNetwork.id)
                    navigate(await recover())
                  } else {
                    navigate(routes.addressTokens())
                  }
                }
              } catch {
                setError("Network already exists")
              }
            }
          }}
        >
          {requestedNetwork && (
            <>
              <InputText
                placeholder="Network ID"
                type="text"
                value={requestedNetwork.id}
                disabled
              />
              <InputText
                placeholder="Name"
                type="text"
                value={requestedNetwork.name}
                disabled
              />
              <InputText
                placeholder="Node URL"
                type="text"
                value={requestedNetwork.nodeUrl}
                disabled
              />
              {/*** Show Optional Fields only if the value is provided */}
              {requestedNetwork.explorerApiUrl && (
                <InputText
                  placeholder="Explorer API URL"
                  type="text"
                  value={requestedNetwork.explorerApiUrl}
                  disabled
                />
              )}
              {requestedNetwork.explorerUrl && (
                <InputText
                  placeholder="Explorer URL"
                  type="text"
                  value={requestedNetwork.explorerUrl}
                  disabled
                />
              )}
            </>
          )}
          {error && <FormError>{error}</FormError>}
          <ButtonGroupVertical>
            {onReject && (
              <Button onClick={onReject} type="button">
                Reject
              </Button>
            )}
            <Button type="submit">
              {mode === "add" ? "Add" : "Switch"} Network
            </Button>
          </ButtonGroupVertical>
        </form>
      </AddTokenScreenWrapper>
    </>
  )
}
