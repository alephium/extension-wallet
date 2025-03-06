import { FC, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { hideToken } from "../../../shared/token/storage"
import { useAppState } from "../../app.state"
import { Alert } from "../../components/Alert"
import { routes } from "../../routes"
import { FormError, P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { TokenIcon } from "./TokenIcon"
import { toTokenView } from "./tokens.service"
import { useToken } from "./tokens.state"
import { useTranslation } from "react-i18next"

export const HideTokenAlert = styled(Alert)`
  padding-top: 32px;
  padding-bottom: 32px;
  margin-bottom: 20px;
`

export const TokenTitle = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`

export const TokenName = styled.h3`
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: ${({ theme }) => theme.text1};
`

export const HideTokenScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { tokenId } = useParams()
  const token = useToken({
    id: tokenId || "Unknown",
    networkId: switcherNetworkId || "Unknown",
  })
  const [error, setError] = useState("")

  if (!token) {
    return <Navigate to={routes.accountTokens()} />
  }

  const { name, logoURI, originChain, unchainedLogoURI } = toTokenView(token)

  const handleSubmit = () => {
    try {
      hideToken(token)
      navigate(routes.accountTokens())
    } catch {
      setError(t("Token not hidden"))
    }
  }

  return (
    <DeprecatedConfirmScreen
      title={t("Hide token")}
      confirmButtonText={t("Confirm")}
      rejectButtonText={t("Cancel")}
      onSubmit={handleSubmit}
    >
      <TokenTitle>
        <TokenIcon logoURI={logoURI} name={name} size={12} verified={token.verified} originChain={originChain} unchainedLogoURI={unchainedLogoURI} />
        <TokenName>{name}</TokenName>
      </TokenTitle>
      {error && <FormError>{error}</FormError>}
      <HideTokenAlert>
        <P>
          {t("To see this token again, you will need to add the token to your account.")}
        </P>
      </HideTokenAlert>
    </DeprecatedConfirmScreen>
  )
}
