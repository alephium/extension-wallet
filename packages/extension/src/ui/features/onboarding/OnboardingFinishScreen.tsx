import { Twitter } from "@mui/icons-material"
import { Slide, SlideProps, Snackbar } from "@mui/material"
import { FC, useCallback } from "react"
import styled from "styled-components"

import { AlephiumLogo } from "../../components/Icons/ArgentXLogo"
import { DiscordIcon } from "../../components/Icons/DiscordIcon"
import {
  CheckCircleOutlineRoundedIcon,
  ExtensionIcon,
  PushPinIcon,
} from "../../components/Icons/MuiIcons"
import Row from "../../components/Row"
import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import {
  DiscordRectButtonIcon,
  RectButton,
  TwitterRectButtonIcon,
} from "./ui/RectButton"
import { useTranslation } from "react-i18next"

const StyledOnboardingButton = styled(OnboardingButton)`
  margin-top: 32px;
`

const StyledSnackbar = styled(Snackbar)`
  .MuiSnackbarContent-root {
    border-radius: 8px;
    margin: 0;
  }
`

const ArgentXButton = styled.div`
  display: flex;
  align-items: center;
  border-radius: 8px;
  background-color: #f0f0f0;
  padding: 12px;
  gap: 12px;
  font-weight: 600;
`

const SnackbarMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 260px;
  font-size: 16px;
`

const SnackbarIconContainer = styled.div`
  margin-right: 12px;
`

const StyledAlephiumLogo = styled(AlephiumLogo)`
  font-size: 20px;
  color: ${({ theme }) => theme.primary};
  width: 1em;
  height: 1em;
`

const StyledPushPinIcon = styled(PushPinIcon)`
  margin-left: auto;
`

const SnackbarMessage: FC = () => {
  const { t } = useTranslation()
  return (
    <SnackbarMessageContainer>
      <Row>
        <SnackbarIconContainer>
          <ExtensionIcon fontSize="inherit" />
        </SnackbarIconContainer>
        <span>{t("Pin the Alephium extension for quick access")}</span>
      </Row>
      <ArgentXButton>
        <StyledAlephiumLogo />
        <span>{t("Alephium")}</span>
        <StyledPushPinIcon fontSize="inherit" />
      </ArgentXButton>
    </SnackbarMessageContainer>
  )
}

const StyledCheckCircleOutlineRoundedIcon = styled(
  CheckCircleOutlineRoundedIcon,
)`
  font-size: 77px; /** gives inner icon ~64px */
`

const TransitionLeft: FC<SlideProps> = (props) => {
  return <Slide {...props} direction="left" />
}

export const OnboardingFinishScreen: FC = () => {
  const { t } = useTranslation()
  const onFinishClick = useCallback(() => {
    window.close()
  }, [])
  return (
    <>
      <StyledSnackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open
        message={<SnackbarMessage />}
        TransitionComponent={TransitionLeft}
      />
      <OnboardingScreen
        length={4}
        currentIndex={3}
        title={t("Your wallet is ready!")}
        subtitle={t("Join Alephium's community")}
        icon={<StyledCheckCircleOutlineRoundedIcon fontSize="inherit" />}
      >
        <Row gap={"12px"} align="stretch">
          <RectButton
            as="a"
            href="https://twitter.com/alephium"
            title={t("Follow Alephium on Twitter")}
            target="_blank"
          >
            <TwitterRectButtonIcon>
              <Twitter />
            </TwitterRectButtonIcon>
            {t("Follow Alephium on Twitter")}
          </RectButton>
          <RectButton
            as="a"
            href="https://alephium.org/discord"
            title={t("Join Alephium's Discord")}
            target="_blank"
          >
            <DiscordRectButtonIcon>
              <DiscordIcon />
            </DiscordRectButtonIcon>
            {t("Join Alephium's Discord")}
          </RectButton>
        </Row>
        <StyledOnboardingButton onClick={onFinishClick}>
          {t("Finish")}
        </StyledOnboardingButton>
      </OnboardingScreen>
    </>
  )
}
