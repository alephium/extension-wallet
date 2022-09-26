import { Variants, motion } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

interface HoverSelectProps {
  items: HoverSelectItem[]
  className?: string
}

export interface HoverSelectItem {
  value: string
  label?: string
  onClick: (value: string) => void
  Component?: ReactNode
}

const initialItemHeight = 30
const expandedItemHeight = 45

const itemVariants: Variants = {
  hover: {
    height: expandedItemHeight,
    width: 120
  }
}

const HoverSelect = ({ items, className }: HoverSelectProps) => {
  return (
    <HoverSelectWrapper role="button" aria-label="Selected network" className={className} whileHover="hover">
      <ItemList
        variants={{
          hover: {
            height: items.length * expandedItemHeight,
            boxShadow: '0 5px 10px rgba(0, 0, 0, 0.8)',
            transition: {
              duration: 0.2,
              ease: 'circOut'
            }
          }
        }}
      >
        {items.map(({ value, label, Component, onClick }) => (
          <ItemContainer key={value} onClick={() => onClick(value)} layout variants={itemVariants}>
            {label ? label : Component ? Component : null}
          </ItemContainer>
        ))}
      </ItemList>
    </HoverSelectWrapper>
  )
}

export default HoverSelect

const HoverSelectWrapper = styled(motion.div)`
  position: relative;
`

const ItemList = styled(motion.div)`
  transform: translateY(-${initialItemHeight / 2}px);
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  height: ${initialItemHeight}px;
  border-radius: 15px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  background-color: ${({ theme }) => theme.bg3};
  overflow: hidden;
`

const ItemContainer = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: right;

  font-weight: 600;
  font-size: 12px;
  line-height: 14.4px;

  padding: 10px;

  height: ${initialItemHeight}px;

  color: rgba(255, 255, 255, 0.7);
  z-index: 1;

  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.text1};

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      border-radius: 15px;
      background-color: rgba(255, 255, 255, 0.05);
      z-index: 0;
    }
  }

  // Selected network
  &:first-child {
    color: ${({ theme }) => theme.text1};
    font-weight: 600;
    cursor: default;
  }

  > span {
    padding-right: 5px;
  }
`
