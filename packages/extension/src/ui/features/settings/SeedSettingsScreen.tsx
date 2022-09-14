import { FC, ReactNode, useState } from 'react'
import styled from 'styled-components'

import { Button } from '../../components/buttons/Button'
import { IconBar } from '../../components/IconBar'
import { useReturnTo } from '../../routes'
import { checkPassword } from '../../services/backgroundSessions'
import { H2, P } from '../../theme/Typography'
import { StickyGroup } from '../actions/ConfirmScreen'
import { PasswordForm } from '../onboarding/PasswordForm'
import { SeedPhrase } from '../recovery/SeedPhrase'
import { useSeedPhrase } from '../recovery/useSeedPhrase'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 32px 0 32px;

  form {
    padding-top: 16px;

    ${Button} {
      margin-top: 16px;
    }
  }
`

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const returnTo = useReturnTo()
  return (
    <>
      <IconBar back close={returnTo} />
      <Container>
        <H2>View recovery phrase</H2>
        {children}
      </Container>
    </>
  )
}

export const SeedSettingsScreen: FC = () => {
  const seedPhrase = useSeedPhrase()
  const [passwordIsValid, setPasswordIsValid] = useState(false)

  if (!passwordIsValid) {
    return (
      <Wrapper>
        <P>Enter your password to view your recovery phrase.</P>

        <PasswordForm
          verifyPassword={async (password) => {
            const isValid = await checkPassword(password)
            setPasswordIsValid(isValid)
            return isValid
          }}
        >
          {(isDirty) => (
            <StickyGroup>
              <Button type="submit" disabled={!isDirty}>
                Continue
              </Button>
            </StickyGroup>
          )}
        </PasswordForm>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <P>Write these words down on paper. It is unsafe to save them on your computer.</P>

      <SeedPhrase seedPhrase={seedPhrase} />
    </Wrapper>
  )
}
