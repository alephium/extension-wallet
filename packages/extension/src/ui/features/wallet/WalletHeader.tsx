import { colord } from 'colord'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

import { useScrollContext } from '../../AppRoutes'
import { Header } from '../../components/Header'

interface WalletHeaderProps {
  title?: string
  buttons?: ReactNode
  className?: string
}

const WalletHeader = ({ title, buttons, className }: WalletHeaderProps) => {
  const theme = useTheme()
  const { scrollBehaviourElementRef } = useScrollContext()

  const { scrollY } = useScroll({ container: scrollBehaviourElementRef })

  const headerBGColor = useTransform(
    scrollY,
    [0, 100],
    [colord(theme.bg.secondary).alpha(0.0).toHex(), colord(theme.bg.primary).alpha(0.9).toHex()]
  )

  const titleY = useTransform(scrollY, [0, 100], [-100, 0])

  return (
    <motion.div className={className} style={{ backgroundColor: headerBGColor }}>
      <Header>
        {title && <motion.h2 style={{ y: titleY }}>{title}</motion.h2>}
        {buttons}
      </Header>
    </motion.div>
  )
}

export default styled(WalletHeader)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 100;
  backdrop-filter: blur(10px);
  ${({ theme }) => theme.mediaMinWidth.sm`
    left: ${theme.margin.extensionInTab};
    right: ${theme.margin.extensionInTab};
  `}
`
