import { StyleHTMLAttributes } from 'react'
import styled from 'styled-components'

import DotSVG from '../images/dot.svg'

interface AddressNameProps {
  name: string
  color: string
  isDefault: boolean
  className?: string
  style?: StyleHTMLAttributes<'span'>
}

const AddressName = ({ name, color, isDefault, className, style }: AddressNameProps) => (
  <span className={className} style={style}>
    <Star>{isDefault && '★'}</Star>
    <Name>{name}</Name>
    <DotIcon color={color} />
  </span>
)

export default styled(AddressName)`
  white-space: nowrap;
  display: flex;
  align-items: center;
  overflow: hidden;
`

const DotIcon = styled(DotSVG)`
  display: inline-block;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  * {
    fill: ${({ color, theme }) => color || theme.text1};
  }
`

const Star = styled.span`
  margin-right: 5px;
  height: 80%;
  opacity: 0.8;
`

const Name = styled.span`
  margin-right: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
`
