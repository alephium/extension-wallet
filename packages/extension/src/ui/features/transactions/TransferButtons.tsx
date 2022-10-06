import { ArrowDown, ArrowUp } from 'lucide-react'
import { FC } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Button } from '../../components/buttons/Button'
import { routes } from '../../routes'

export const TransferButtons: FC = () => {
  return (
    <Container>
      <StyledLink to={routes.fundingQrCode('undefined')}>
        <Button>
          <ArrowDown />
          Receive
        </Button>
      </StyledLink>
      <StyledLink to={routes.sendToken('undefined')}>
        <Button>
          <ArrowUp />
          Send
        </Button>
      </StyledLink>
    </Container>
  )
}

const Container = styled.div`
  margin: 8px 15px 24px 15px;
  display: flex;
  gap: 10px;
  max-width: 400px;
`

const StyledLink = styled(Link)`
  flex: 1;
`
