import { BarCloseButton, NavigationContainer, icons } from "@argent/ui"
import { FC } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper, Paragraph, Title } from "../../components/Page"
import { routes, useReturnTo } from "../../routes"
import { useTranslation } from "react-i18next"

const { RestoreIcon } = icons

const CircleIconContainer = styled.div`
  border-radius: 500px;
  display: flex;
  font-size: 24px;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${({ theme }) => theme.neutrals600};
  background-color: ${({ theme }) => theme.white};
`

export const RecoverySetupScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  return (
    <NavigationContainer
      rightButton={
        <BarCloseButton
          onClick={() => navigate(returnTo || routes.accountTokens())}
        />
      }
    >
      <PageWrapper>
        <Title>{t("Set up account recovery")}</Title>
        <Paragraph>
          {t("Choose one or more of the methods below to ensure you can access your accounts.")}
        </Paragraph>
        <OptionsWrapper>
          <Link to={routes.setupSeedRecovery(returnTo)}>
            <Option
              title={t("Save the recovery phrase")}
              icon={
                <CircleIconContainer>
                  <RestoreIcon />
                </CircleIconContainer>
              }
            />
          </Link>
        </OptionsWrapper>
      </PageWrapper>
    </NavigationContainer>
  )
}
