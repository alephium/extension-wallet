import { BarBackButton, NavigationContainer } from "@argent/ui"
import { BigNumber } from "@ethersproject/bignumber"
import React, { FC, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { addToken } from "../../../shared/token/storage"
import { Token } from "../../../shared/token/type"
import { useAppState } from "../../app.state"
import { Button, ButtonGroupHorizontal } from "../../components/Button"
import { InfoCircle } from "../../components/Icons/InfoCircle"
import { InputText } from "../../components/InputText"
import Row from "../../components/Row"
import { routes } from "../../routes"
import { isValidTokenId } from "../../services/token"
import { FormError, H2, WarningText } from "../../theme/Typography"
import { useTokensInNetwork } from "../accountTokens/tokens.state"
import * as yup from "yup"
import { useTranslation } from "react-i18next"

const AddTokenScreenWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0 32px 48px 32px;

  > form {
    width: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;
  }

  ${Button} {
    margin-top: 64px;
  }
`

const TokenWarningWrapper = styled(Row)`
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 191, 61, 0.1);
  gap: 12px;
`

const ButtonSpacer = styled.div`
  display: flex;
  flex: 1;
`

function isValidUrl(url: string | undefined): boolean {
  return !!url && yup.string().url().isValidSync(url)
}

const isDataComplete = (data: Partial<Token>): data is Token => {
  if (
    data.id &&
    isValidTokenId(data.id) &&
    (!data.logoURI || isValidUrl(data.logoURI)) &&
    data.decimals?.toString() &&
    data.name &&
    data.symbol
  ) {
    return true
  }
  return false
}

interface AddTokenScreenProps {
  defaultToken?: Token
  hideBackButton?: boolean
  onSubmit?: () => void
  onReject?: () => void
}

export const AddTokenScreen: FC<AddTokenScreenProps> = ({
  defaultToken,
  hideBackButton,
  onSubmit,
  onReject,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const [tokenId, setTokenId] = useState(defaultToken?.id || "")
  const [logoURI, setLogoURI] = useState(defaultToken?.logoURI || "")
  const [tokenName, setTokenName] = useState(defaultToken?.name || "")
  const [tokenSymbol, setTokenSymbol] = useState(defaultToken?.symbol || "")
  const [tokenDecimals, setTokenDecimals] = useState(
    defaultToken?.decimals || "0",
  )
  const [error, setError] = useState("")
  const tokensInNetwork = useTokensInNetwork(switcherNetworkId)

  const tokenExist = useMemo(
    () =>
      tokensInNetwork.some(
        (token) => defaultToken && token.id === defaultToken.id,
      ),
    [defaultToken, tokensInNetwork],
  )

  useEffect(() => {
    const found = tokensInNetwork.find((token) => token.id === tokenId)
    if (found) {
      setTokenName(found.name || "")
      setTokenSymbol(found.symbol || "")
      setTokenDecimals(found.decimals || 0)
      setLogoURI(found.logoURI || "")
    }
  }, [tokenId])

  const compiledData = {
    id: tokenId,
    ...(tokenName && { name: tokenName }),
    ...(tokenSymbol && { symbol: tokenSymbol }),
    ...(logoURI && { logoURI: logoURI }),
    decimals: parseInt(tokenDecimals.toString(), 10) || 0,
    networkId: switcherNetworkId,
  }

  return (
    <NavigationContainer leftButton={hideBackButton ? null : <BarBackButton />}>
      <AddTokenScreenWrapper>
        <H2>{t("Add tokens")}</H2>

        {tokenExist && (
          <TokenWarningWrapper>
            <InfoCircle />
            <WarningText>
              {t("This action will edit tokens that are already listed in your wallet, which can be used to phish you. Only approve if you are certain that you mean to change what these tokens represent.")}
            </WarningText>
          </TokenWarningWrapper>
        )}

        <form
          onSubmit={async (e: React.FormEvent) => {
            e.preventDefault()
            if (isDataComplete(compiledData)) {
              try {
                await addToken(compiledData, true)
                onSubmit?.()
                navigate(routes.accountTokens())
              } catch (e) {
                setError(t("Token already exists"))
              }
            }
          }}
        >
          <InputText
            autoFocus
            placeholder={t("Token ID")}
            type="text"
            value={tokenId}
            onChange={(e: any) => {
              setTokenId(e.target.value?.toLowerCase())
            }}
          />
          <InputText
            placeholder={t("Name")}
            type="text"
            value={tokenName}
            onChange={(e: any) => setTokenName(e.target.value)}
          />
          <InputText
            placeholder={t("Symbol")}
            type="text"
            value={tokenSymbol}
            onChange={(e: any) => setTokenSymbol(e.target.value)}
          />
          <InputText
            placeholder={t("Decimals")}
            type="text"
            value={tokenDecimals}
            onChange={(e: any) => {
              try {
                BigNumber.from(e.target.value || "0")
                setTokenDecimals(e.target.value)
              } catch {
                // pass
              }
            }}
          />
          <InputText
            placeholder={t("Logo URL")}
            type="text"
            value={logoURI}
            onChange={(e: any) => setLogoURI(e.target.value)}
          />
          {error && <FormError>{error}</FormError>}
          <ButtonSpacer />
          <ButtonGroupHorizontal>
            {onReject && (
              <Button onClick={onReject} type="button">
                {t("Reject")}
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isDataComplete(compiledData)}
            >
              {t("Continue")}
            </Button>
          </ButtonGroupHorizontal>
        </form>
      </AddTokenScreenWrapper>
    </NavigationContainer>
  )
}
