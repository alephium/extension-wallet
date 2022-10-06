import { ReactNode } from 'react'
import { Link, To } from 'react-router-dom'
import styled from 'styled-components'

import { IconButton } from './IconButton'

interface IconWithLabelButtonProps {
  Icon: ReactNode
  label: string
  to: To
  className?: string
}

const IconWithLabelButton = ({ Icon, label, to, className }: IconWithLabelButtonProps) => (
  <div className={className}>
    <LabeledLink to={to}>
      <IconButton size={40}>{Icon}</IconButton>
      <label>{label}</label>
    </LabeledLink>
  </div>
)

export default styled(IconWithLabelButton)`
  margin: 8px 0 24px 0;
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 36px;
`

const LabeledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  color: inherit;
  text-decoration: inherit;
  cursor: pointer;

  ${IconButton} {
    background-color: rgba(255, 255, 255, 0.25);
    &:hover {
      background-color: rgba(255, 255, 255, 0.4);
    }
  }
  & > label {
    margin-top: 12px;
    font-weight: 600;
    font-size: 15px;
    line-height: 20px;
  }
`
