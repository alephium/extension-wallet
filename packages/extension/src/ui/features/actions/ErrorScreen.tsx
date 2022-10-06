import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useAppState } from '../../app.state'
import { P } from '../../theme/Typography'
import { ConfirmScreen } from './ConfirmScreen'

export const Pre = styled.pre`
  margin-top: 24px;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  max-width: calc(100vw - 64px);
  overflow: auto;
`

const SP = styled(P)`
  font-size: 18px;
  line-height: 24px;
`

const WrappingPre = styled(Pre)`
  white-space: pre-wrap;
`

export const ErrorScreen: FC = () => {
  const navigate = useNavigate()
  const { error } = useAppState()

  const message = error ? error.replace(/^(error:\s*)+/gi, '') : 'No error message available'

  return (
    <ConfirmScreen title="Error" confirmButtonText="Back" singleButton onSubmit={() => navigate(-1)}>
      <SP>Something went wrong:</SP>
      <WrappingPre>{message}</WrappingPre>
    </ConfirmScreen>
  )
}
