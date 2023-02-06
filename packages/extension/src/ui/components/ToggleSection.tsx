import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'
import styled from 'styled-components'

import Toggle from './Toggle'

interface ToggleSectionProps {
  title: string
  marginTop?: boolean
  children: ReactNode
  onClick?: (b: boolean) => void
  className?: string
}

const ToggleSection = ({ title, marginTop, onClick = () => null, children, className }: ToggleSectionProps) => {
  const [isShown, setIsShown] = useState(false)

  const handleToggle = () => {
    setIsShown(!isShown)
    onClick(isShown)
  }

  return (
    <div className={className} style={{ marginTop: marginTop ? '20px' : 0 }}>
      <CellControl>
        <Label>{title}</Label>
        <Toggle onToggle={handleToggle} label={title} toggled={isShown} />
      </CellControl>
      <CellChildren
        animate={{
          height: isShown ? 'auto' : 0,
          opacity: isShown ? 1 : 0,
          visibility: isShown ? 'visible' : 'hidden'
        }}
        transition={{ duration: 0.2 }}
      >
        <CellChildrenInner>{children}</CellChildrenInner>
      </CellChildren>
    </div>
  )
}

export default styled(ToggleSection)`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 9px;
  padding-bottom: 21px;
`

const Label = styled.span`
  color: ${({ theme }) => theme.text2};
  font-weight: normal;
  height: 20px;
  font-size: 17px;
`

const CellControl = styled.div`
  justify-content: space-between;
  flex-direction: row;
  display: flex;
  align-items: center;
  font-weight: 400;
  padding: 21px 21px 0 21px;
`

const CellChildren = styled(motion.div)`
  overflow: hidden;
  height: 0;
  opacity: 0;
  visibility: hidden;
`

const CellChildrenInner = styled.div`
  border-top: 0px solid ${({ theme }) => theme.text1};
  padding: 0 21px;
`
