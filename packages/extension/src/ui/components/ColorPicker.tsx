import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { TwitterPicker } from 'react-color'
import { useDetectClickOutside } from 'react-detect-click-outside'
import styled, { useTheme } from 'styled-components'

import { getRandomLabelColor, labelColorPalette } from '../../shared/utils/colors'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

const ColorPicker = ({ value, onChange, className }: ColorPickerProps) => {
  const color = value?.toString() || getRandomLabelColor()
  const theme = useTheme()

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const ref = useDetectClickOutside({ onTriggered: () => setIsPopupOpen(false) })

  const handlePopupOpen = () => setIsPopupOpen(!isPopupOpen)
  const onChangeComplete = (newColor: { hex: string }) => {
    onChange(newColor.hex)
    handlePopupOpen()
  }

  return (
    <div className={className} aria-label="Pick a color" ref={ref}>
      <InputContainer onClick={handlePopupOpen}>
        <Label>Color</Label>
        <Circle color={color} />
      </InputContainer>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isPopupOpen && (
          <Popup initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TwitterPicker
              color={color}
              onChangeComplete={onChangeComplete}
              colors={labelColorPalette}
              triangle="top-right"
              styles={{
                default: {
                  card: {
                    backgroundColor: theme.bg2,
                    borderRadius: '9px'
                  },
                  triangle: {
                    borderColor: `transparent transparent ${theme.bg2}`
                  },
                  hash: {
                    backgroundColor: theme.bg3,
                    marginTop: '5px'
                  },
                  input: {
                    backgroundColor: theme.bg3,
                    boxShadow: 'none',
                    color: theme.text1,
                    height: '30px',
                    marginTop: '5px'
                  }
                }
              }}
            />
          </Popup>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ColorPicker

const InputContainer = styled.div`
  position: relative;
  width: auto;
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 9px;
  height: 57px;
  padding: 15px;
  background-color: ${({ theme }) => theme.bg3};
  margin-top: 20px;
  cursor: pointer;

  * {
    cursor: pointer;
  }
`

const Label = styled.label`
  color: ${({ theme }) => theme.text2};
  font-weight: normal;
  font-size: 17px;
  flex: 1;
`

const Circle = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 20px;
  background-color: ${({ color }) => color};
`

const Popup = styled(motion.div)`
  z-index: 1;
  position: absolute;
  transform: translate3d(-34px, -5px, 0);
  right: 0;
  z-index: 1000;
`
