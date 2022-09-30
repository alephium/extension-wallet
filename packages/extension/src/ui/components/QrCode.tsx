import { colord } from 'colord'
import QRCodeStyling from 'qr-code-styling'
import { FC, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

interface QrCodeProps {
  size: number
  data: string
  color?: string
  className?: string
}

const QrCode: FC<QrCodeProps> = ({ size, data, color, className, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isDark = color && colord(color).isDark()

  const dotColor = isDark ? 'white' : 'black'

  const qrCode = useMemo(
    () =>
      new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        dotsOptions: { type: 'dots' },
        cornersSquareOptions: { type: 'dot' },
        cornersDotOptions: { type: 'dot' },
        backgroundOptions: { color: 'transparent' },
        imageOptions: {
          crossOrigin: 'anonymous'
        }
      }),
    [size]
  )

  useEffect(() => {
    qrCode.append(ref.current ?? undefined)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    qrCode.update({
      data,
      dotsOptions: { color: dotColor },
      cornersSquareOptions: { color: dotColor },
      cornersDotOptions: { color: dotColor }
    })
    // only on data change
  }, [data, dotColor, qrCode])

  return (
    <div className={className} style={{ backgroundColor: color }}>
      <div ref={ref} className="qrcode" {...props} />
    </div>
  )
}

export default styled(QrCode)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48px;
  overflow: hidden;
  padding: 24px;
`
