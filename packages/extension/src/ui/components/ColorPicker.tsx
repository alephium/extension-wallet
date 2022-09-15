import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { TwitterPicker } from 'react-color'
import { useDetectClickOutside } from 'react-detect-click-outside'
import styled from 'styled-components'

import { getRandomLabelColor, labelColorPalette } from '../../shared/utils/colors'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const color = value?.toString() || getRandomLabelColor()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const ref = useDetectClickOutside({ onTriggered: () => setIsPopupOpen(false) })

  const handlePopupOpen = () => setIsPopupOpen(!isPopupOpen)
  const onChangeComplete = (newColor: { hex: string }) => {
    onChange(newColor.hex)
    handlePopupOpen()
  }

  return (
    <ColorPickerContainer ref={ref}>
      <InputCircle aria-label="Pick a color" onInput={handlePopupOpen}>
        <Circle color={color} />
      </InputCircle>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isPopupOpen && (
          <Popup initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TwitterPickerStyled
              color={color}
              onChangeComplete={onChangeComplete}
              colors={labelColorPalette}
              triangle="top-right"
            />
          </Popup>
        )}
      </AnimatePresence>
    </ColorPickerContainer>
  )
}

export default ColorPicker

const ColorPickerContainer = styled.div`
  position: relative;
  width: auto;
  display: inline-flex;
  flex-direction: column;
`

const InputCircle = styled.div`
  height: 50px;
  width: 50px;
`

const Popup = styled(motion.div)`
  z-index: 1;
  position: absolute;
  top: calc(var(--inputHeight) + 10px);
  right: 0;
`

const TwitterPickerStyled = styled(TwitterPicker)``

const Circle = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 16px;
  background-color: ${({ color }) => color};
`
