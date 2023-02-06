import { Transition, motion } from 'framer-motion'
import { useCallback } from 'react'
import styled, { css, useTheme } from 'styled-components'

interface ToggleProps {
  toggled: boolean
  onToggle: (value: boolean) => void
  disabled?: boolean
  handleColors?: [string, string]
  label?: string
  className?: string
}

const toggleWidth = 52 // px

const Toggle = ({ toggled, onToggle, className, disabled, handleColors, label }: ToggleProps) => {
  const theme = useTheme()

  const toggleBackgroundVariants = {
    off: { backgroundColor: theme.bg1 },
    on: { backgroundColor: handleColors ? theme.bg1 : theme.bg2 }
  }

  const handleContainerVariants = {
    off: { left: 0 },
    on: { left: toggleWidth / 2 }
  }

  const handleVariants = {
    off: { backgroundColor: handleColors?.[0] ?? theme.text1 },
    on: { backgroundColor: handleColors?.[1] ?? theme.text1 }
  }

  const toggleState = toggled ? 'on' : 'off'

  const transition: Transition = { duration: 0.2, type: 'tween' }

  const handleSwitch = useCallback(() => {
    if (!disabled) {
      onToggle(!toggled)
    }
  }, [disabled, toggled, onToggle])

  return (
    <StyledToggle
      onClick={handleSwitch}
      onKeyPress={handleSwitch}
      className={className}
      aria-label={label}
      aria-checked={toggled}
      role="checkbox"
      tabIndex={0}
      variants={toggleBackgroundVariants}
      animate={toggleState}
      transition={transition}
      disabled={disabled}
    >
      <ToggleHandleContainer variants={handleContainerVariants} animate={toggleState} transition={transition}>
        <ToggleHandle variants={handleVariants} animate={toggleState} transition={transition} />
      </ToggleHandleContainer>
    </StyledToggle>
  )
}

export default Toggle

export const StyledToggle = styled(motion.div) <{ disabled?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  width: ${toggleWidth}px;
  height: calc(${toggleWidth}px / 2);
  border-radius: ${toggleWidth}px;
  overflow: hidden;
  cursor: pointer;
  box-sizing: content-box;

  svg {
    cursor: pointer;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.5;
    `}
`

const ToggleHandleContainer = styled(motion.div)`
  position: absolute;
  width: calc(${toggleWidth}px / 2);
  height: calc(${toggleWidth}px / 2);
  z-index: 0;
  padding: 2px;
`

const ToggleHandle = styled(motion.div)`
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.text1};
  border-radius: ${toggleWidth}px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
`
