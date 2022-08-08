import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Button, ButtonGroup } from "../../components/Button"
import { routes } from "../../routes"
import { H2 } from "../../theme/Typography"
import { P } from "../../theme/Typography"
import LogoSvg from "./logo.svg"

export const GreetingsWrapper = styled.div`
  position: relative;

  margin: 16px 0px;
  height: 41px;
  width: 100%;
`

const WelcomeScreenWrapper = styled.div`
  padding: 70px 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > ${GreetingsWrapper} {
    text-align: center;
  }

  > ${P} {
    text-align: center;
    margin-top: 1em;
  }

  > ${ButtonGroup} {
    margin-top: 64px;
  }
`

const Text = styled(H2)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

export const WelcomeScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <WelcomeScreenWrapper>
      <LogoSvg />
      <GreetingsWrapper>
        <Text>Welcome</Text>
      </GreetingsWrapper>
      <P>Accessible, Scalable and Secure DeFi</P>
      <ButtonGroup>
        <Button onClick={() => navigate(routes.newWallet())}>New wallet</Button>
        <Button onClick={() => navigate(routes.seedRecovery())}>
          Restore wallet
        </Button>
      </ButtonGroup>
    </WelcomeScreenWrapper>
  )
}
