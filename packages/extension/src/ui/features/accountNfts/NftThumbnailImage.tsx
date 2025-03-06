import { Flex, Image, Spinner } from "@chakra-ui/react"
import { FC, ImgHTMLAttributes, useRef } from "react"

import { NftFallback } from "./NftFallback"
import { isMp4Url } from "./alephium-nft.service"

type NftThumbnailImage = ImgHTMLAttributes<HTMLImageElement>

export const NftThumbnailImage: FC<NftThumbnailImage> = ({ src, ...rest }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  if (!src) {
    return <NftFallback />
  }

  if (isMp4Url(src)) {
    return (
      <video
        ref={videoRef}
        src={src}
        style={{
          width: '142px',
          height: '142px',
          borderRadius: '8px',
          position: 'relative',
          objectFit: 'cover',
          cursor: 'pointer'
        }}
        onMouseEnter={() => videoRef.current?.play()}
        onMouseLeave={() => {
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
          }
        }}
        loop
        muted
        playsInline
      />
    )
  } else {
    return (
      <Image
        src={src}
        {...rest}
        w="142px"
        h="142px"
        borderRadius="lg"
        position="relative"
        objectFit="cover"
        fallback={
          <Flex w="142px" h="142px" justifyContent="center" alignItems="center">
            <Spinner />
          </Flex>
        }
      />
    )
  }
}
