import { BarBackButton, NavigationContainer } from "@argent/ui"
import { Ghost } from "lucide-react"
import { FC, useMemo } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../shared/token/price"
import { Button } from "../../components/Button"
import { ColumnCenter } from "../../components/Column"
import { FormatListBulletedIcon } from "../../components/Icons/MuiIcons"
import { LoadingPulse } from "../../components/LoadingPulse"
import { RowCentered } from "../../components/Row"
import { routes } from "../../routes"
import { H3 } from "../../theme/Typography"
import { useSelectedAccount } from "../accounts/accounts.state"
import { TokenIcon } from "./TokenIcon"
import { TokenMenuDeprecated } from "./TokenMenuDeprecated"
import { useTokenBalanceToCurrencyValue } from "./tokenPriceHooks"
import { toTokenView } from "./tokens.service"
import { useFungibleTokensWithBalance } from "./tokens.state"
import { useTranslation } from "react-i18next"

const TokenScreenWrapper = styled(ColumnCenter)`
  width: 100%;
`

const TokenHeader = styled(RowCentered) <{ hasCurrencyValue: boolean }>`
  width: 100%;
  flex: 1;
  background-color: #000000;
  padding: ${({ hasCurrencyValue }) => (hasCurrencyValue ? "28px" : "42px")};
`
const ActionContainer = styled(ColumnCenter)`
  width: 100%;
  flex: 2;
  padding: 24px;
  gap: 84px;
`

const CurrencyValueText = styled.div`
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  margin-top: 8px;
`

const ActivityIconWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  padding: 14.5px;
  border-radius: 50%;
`

const ActivityText = styled.div`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  text-align: center;
  color: ${({ theme }) => theme.text4};
`

const ComingSoonText = styled.div`
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  color: ${({ theme }) => theme.text3};
`

const TokenBalanceContainer = styled(RowCentered)`
  gap: 8px;
  margin-top: 12px;
  align-items: baseline;
`

const tokenIcon = (name: string, size: number, logoURI?: string, verified?: boolean, originChain?: string, unchainedLogoURI?: string) => {
  return logoURI ? (
    <TokenIcon name={name} logoURI={logoURI} size={size} verified={verified} originChain={originChain} unchainedLogoURI={unchainedLogoURI} />
  ) : (
    <Ghost size={size * 0.7} />
  )
}

export const TokenScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tokenId } = useParams()
  const account = useSelectedAccount()
  const { tokenDetails, tokenDetailsIsInitialising, isValidating } = useFungibleTokensWithBalance(account)
  const token = useMemo(
    () => tokenDetails.find(({ id }) => id === tokenId),
    [tokenId, tokenDetails],
  )
  const currencyValue = useTokenBalanceToCurrencyValue(token)

  if (!token) {
    return <Navigate to={routes.accounts()} />
  }

  const { id, name, symbol, logoURI, verified, originChain, unchainedLogoURI, showAlways } = toTokenView(token)
  const displayBalance = prettifyTokenBalance(token, false)
  const isLoading = isValidating || tokenDetailsIsInitialising

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={<TokenMenuDeprecated tokenId={id} canHideToken={!showAlways} />}
      title={name === "Ether" ? "Ethereum" : name}
    >
      <TokenScreenWrapper>
        <TokenHeader hasCurrencyValue={!!currencyValue}>
          <ColumnCenter>
            {tokenIcon(name, 12, logoURI, verified, originChain, unchainedLogoURI)}
            <TokenBalanceContainer>
              <LoadingPulse
                isLoading={isLoading}
                display="flex"
                alignItems="center"
                gap="2"
              >
                <H3
                  data-testid={
                    isLoading ? "tokenBalanceIsLoading" : "tokenBalance"
                  }
                >
                  {displayBalance}
                </H3>
                <H3>{symbol}</H3>
              </LoadingPulse>
            </TokenBalanceContainer>
            {currencyValue && (
              <CurrencyValueText>
                {prettifyCurrencyValue(currencyValue)}
              </CurrencyValueText>
            )}
          </ColumnCenter>
        </TokenHeader>
        <ActionContainer>
          <Button
            type="button"
            onClick={() => navigate(routes.sendToken(id))}
          >
            {t("Send")}
          </Button>

          <ColumnCenter gap="12px">
            <ActivityIconWrapper>
              <FormatListBulletedIcon />
            </ActivityIconWrapper>
            <ColumnCenter>
              <ActivityText>{t("Activity")}</ActivityText>
              <ComingSoonText>{t("Coming Soon")}</ComingSoonText>
            </ColumnCenter>
          </ColumnCenter>
        </ActionContainer>
      </TokenScreenWrapper>
    </NavigationContainer>
  )
}
