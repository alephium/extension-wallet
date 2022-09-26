import { Variants, motion } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState } from 'react'
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

const listWidth = 120
const maxListHeight = 300

const itemVariants: Variants = {
  hover: {
    height: expandedItemHeight,
    width: listWidth
  }
}

const HoverSelect = ({ items, className }: HoverSelectProps) => {
  const [isMaxHeight, setIsMaxHeight] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)

  console.log(listRef.current?.clientHeight)

  useEffect(() => {
    setIsMaxHeight(items.length * expandedItemHeight >= maxListHeight)
  }, [items.length])

  const handleHoverStart = () => {
    // Scroll to top
    listRef.current?.scroll(0, 0)
  }

  return (
    <HoverSelectWrapper
      role="button"
      aria-label="Selected network"
      className={className}
      whileHover="hover"
      onHoverStart={handleHoverStart}
    >
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
        ref={listRef}
      >
        {items.map(({ value, label, Component, onClick }) => (
          <ItemContainer key={value} onClick={() => onClick(value)} layout variants={itemVariants}>
            {label ? label : Component ? Component : null}
          </ItemContainer>
        ))}
        {isMaxHeight && <ItemListBottomShadow />}
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
  overflow: auto;
  max-height: ${maxListHeight}px;

  overscroll-behavior: none;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`

const ItemListBottomShadow = styled.div`
  position: sticky;
  top: ${maxListHeight - 50 - initialItemHeight / 2}px;
  right: 0;
  width: ${listWidth}px;
  height: 50px;
  background: linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
  z-index: 3000;
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
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.bg3};
    z-index: 2;
  }

  > span {
    padding-right: 5px;
  }
`
