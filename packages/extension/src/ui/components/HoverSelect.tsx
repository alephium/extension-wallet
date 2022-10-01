import { colord } from 'colord'
import { MotionStyle, Transition, Variants, motion } from 'framer-motion'
import { ReactNode, useRef, useState } from 'react'
import styled, { useTheme } from 'styled-components'

interface HoverSelectProps {
  items: HoverSelectItem[]
  onItemClick: (value: string) => void
  selectedItemValue?: string
  title: string
  dimensions?: {
    initialItemHeight?: number
    expandedItemHeight?: number
    initialListWidth?: number | string
    expandedListWidth?: number | string
    maxListHeight?: number | string
  }
  borderRadius?: number
  className?: string
  style?: MotionStyle
}

export interface HoverSelectItem {
  value: string
  label?: string
  Component?: ReactNode
}

const transition: Transition = { type: 'tween', duration: 0.15 }

const HoverSelect = ({
  items,
  onItemClick,
  selectedItemValue,
  title,
  dimensions = {
    initialItemHeight: 30,
    expandedItemHeight: 45,
    initialListWidth: 110,
    expandedListWidth: 140,
    maxListHeight: 300
  },
  borderRadius = 15,
  className,
  style
}: HoverSelectProps) => {
  const theme = useTheme()
  const [isHovering, setIsHovering] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)

  const { initialItemHeight, expandedItemHeight, initialListWidth, expandedListWidth, maxListHeight } =
    dimensions as Required<typeof dimensions>

  const orderedItems = [
    ...items.filter(({ value }) => selectedItemValue === value),
    ...items.filter(({ value }) => selectedItemValue !== value)
  ]

  const itemContainerVariants: Variants = {
    initial: {
      height: initialItemHeight
    },
    hover: {
      height: expandedItemHeight,
      transition
    }
  }

  const handleHoverStart = () => {
    setIsHovering(true)

    // Scroll to top
    listRef.current?.scroll(0, 0)
  }

  const handleHoverEnd = () => {
    setIsHovering(false)
  }

  const handleItemClick = (value: string) => {
    onItemClick(value)
  }

  const isSelected = (value: string) => selectedItemValue === value

  const shouldAnimateItem = (value: string) => isSelected(value) && isHovering

  return (
    <HoverSelectWrapper
      role="button"
      aria-label="Selected network"
      className={className}
      initial="initial"
      whileHover="hover"
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={{ height: initialItemHeight, ...style }}
    >
      <ItemList
        variants={{
          hover: {
            height: items.length * expandedItemHeight,
            width: expandedListWidth,
            boxShadow: '0 5px 10px rgba(0, 0, 0, 0.8)'
          }
        }}
        style={{
          height: initialItemHeight,
          width: initialListWidth,
          maxHeight: maxListHeight,
          borderRadius: borderRadius
        }}
        transition={transition}
        ref={listRef}
      >
        {orderedItems.map(({ value, label, Component }) => (
          <ItemContainer
            key={value}
            onClick={() => handleItemClick(value)}
            animate={{
              backgroundColor: shouldAnimateItem(value) ? colord(theme.bg3).lighten(0.05).toHex() : theme.bg3
            }}
            variants={itemContainerVariants}
            style={{
              height: initialItemHeight
            }}
            borderRadius={borderRadius}
          >
            <Title
              transition={{
                duration: 0.1
              }}
              animate={{
                opacity: shouldAnimateItem(value) ? 1 : 0
              }}
              style={{
                top: expandedItemHeight / 10
              }}
            >
              {title}
            </Title>
            <ItemContent
              animate={{
                marginTop: shouldAnimateItem(value) ? expandedItemHeight / 3 : 0
              }}
            >
              {label ? label : Component ? Component : null}
            </ItemContent>
          </ItemContainer>
        ))}
      </ItemList>
    </HoverSelectWrapper>
  )
}

export default HoverSelect

const HoverSelectWrapper = styled(motion.div)`
  position: relative;
  flex: 1;
`

const ItemList = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin-right: auto;
  margin-left: auto;
  z-index: 3;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  background-color: ${({ theme }) => theme.bg3};
  overflow: auto;

  overscroll-behavior: none;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`

const ItemContainer = styled(motion.div)<{ borderRadius: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  width: 100%;

  font-weight: 600;
  font-size: 12px;
  line-height: 14.4px;

  padding: 10px;

  background-color: ${({ theme }) => theme.bg3};
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
      border-radius: ${({ borderRadius }) => borderRadius}px;
      background-color: rgba(255, 255, 255, 0.03);
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
    border-radius: ${({ borderRadius }) => borderRadius}px;
    z-index: 2;
  }

  > span {
    padding-right: 5px;
  }
`

const ItemContent = styled(motion.div)``

const Title = styled(motion.span)`
  position: absolute;
  opacity: 0;
  color: ${({ theme }) => theme.text2};
  font-size: 10px;
`
