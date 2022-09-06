import { colord } from 'colord'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

import { useScrollContext } from '../../AppRoutes'

interface AddressHeaderProps {
  children?: ReactNode
  className?: string
}

const AddressHeader = ({ className, children }: AddressHeaderProps) => {
  const theme = useTheme()
  const { scrollBehaviourElementRef } = useScrollContext()

  const { scrollY } = useScroll({ container: scrollBehaviourElementRef })

  console.log(scrollBehaviourElementRef)
  scrollY.onChange((v) => console.log(v))

  const headerBGColor = useTransform(
    scrollY,
    [0, 100],
    [colord(theme.bg1).alpha(0.0).toHex(), colord(theme.bg2).alpha(0.9).toHex()]
  )

  return (
    <motion.div className={className} style={{ backgroundColor: headerBGColor }}>
      {children}
    </motion.div>
  )
}

export default styled(AddressHeader)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 68px;
  z-index: 100;
  backdrop-filter: blur(10px);
  ${({ theme }) => theme.mediaMinWidth.sm`
    left: ${theme.margin.extensionInTab};
    right: ${theme.margin.extensionInTab};
  `}
`
