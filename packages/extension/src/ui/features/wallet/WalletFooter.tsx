import { colord } from 'colord'
import { motion, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { clamp } from 'lodash'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { useScrollContext } from '../../AppRoutes'

interface WalletFooterProps {
  children?: ReactNode
  className?: string
}

const WalletFooter = ({ children, className }: WalletFooterProps) => {
  const { scrollBehaviourElementRef } = useScrollContext()

  const { scrollY } = useScroll({ container: scrollBehaviourElementRef })

  const lastScrollY = useMotionValue(0)
  const lastTranslateY = useMotionValue(0)

  const translateYValue = useTransform(scrollY, (scrollY) => {
    if (lastScrollY === undefined) {
      return 0
    }

    const value = clamp(lastTranslateY.get() + (scrollY - lastScrollY.get()), 0, 80)

    lastTranslateY.set(value)
    lastScrollY.set(scrollY)

    return value
  })

  return (
    <motion.div className={className} style={{ y: translateYValue }}>
      <Content>{children}</Content>
    </motion.div>
  )
}

export default styled(WalletFooter)`
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90px;
`

const Content = styled.div`
  display: flex;
  border-radius: 12px;
  padding: 5px;
  gap: 5px;
  background: ${({ theme }) => colord(theme.bg4).alpha(0.4).toRgbString()};
  box-shadow: 0px 2px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);

  ${({ theme }) => theme.mediaMinWidth.sm`
    left: ${theme.margin.extensionInTab};
    right: ${theme.margin.extensionInTab};
  `}
`

export const FooterTab = styled(Link)<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 9px;
  width: 75px;
  font-size: 12px;

  svg {
    font-size: 1.8rem;
  }

  span {
    margin-top: 3px;
  }

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.05);
  }

  color: ${({ isActive, theme }) => (isActive ? theme.text1 : theme.text2)};

  background-color: ${({ isActive }) => (isActive ? 'rgba(255, 255, 255, 0.1)' : 'initial')};
`
