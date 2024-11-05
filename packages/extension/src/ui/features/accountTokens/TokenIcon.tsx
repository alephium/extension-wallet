import { Circle, Image, Tooltip } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import { generateAvatarImage } from "../../../shared/avatarImage"
import { WarningIconRounded } from "../../components/Icons/WarningIconRounded"
import { getColor } from "../accounts/accounts.service"
import { BSCIcon } from "../../components/Icons/BSCIcon"
import { EthereumIcon } from "../../components/Icons/EthereumIcon"
export interface TokenIconProps
  extends Pick<ComponentProps<typeof Circle>, "size">,
  ComponentProps<typeof Image> {
  name: string
  logoURI?: string
  verified?: boolean
  originChain?: string
  unchainedLogoURI?: string
}

export const getTokenIconUrl = ({
  logoURI,
  name,
}: Pick<TokenIconProps, "logoURI" | "name">) => {
  if (logoURI && logoURI.length) {
    return logoURI
  }
  const background = getColor(name)
  return generateAvatarImage(name, { background })
}

export const TokenIcon: FC<TokenIconProps> = ({ name, logoURI, size, verified, originChain, unchainedLogoURI, ...rest }) => {
  const overlayChainLogo = originChain && verified && unchainedLogoURI

  const originChainIcon = () => {
    if (!overlayChainLogo) {
      return undefined
    }

    switch (originChain.toLowerCase()) {
      case 'bsc':
        return <BSCIcon />
      case 'eth':
        return <EthereumIcon />
      default:
        return undefined
    }
  }

  const src = getTokenIconUrl({ logoURI: overlayChainLogo ? unchainedLogoURI : logoURI, name })

  return (
    <Circle
      size={size}
      position={"relative"}
      bg={"neutrals.600"}
      {...rest}
    >
      <Circle position={"relative"} overflow={"hidden"} size={size} {...rest}>
        <Image
          position={"absolute"}
          left={0}
          right={0}
          top={0}
          bottom={0}
          alt={name}
          src={src}
        />
      </Circle>
      {!verified && (
        <Tooltip label={"Unknown Token"} shouldWrapChildren={true}>
          <Circle
            overflow={"hidden"}
            position={"absolute"}
            right={0}
            top={0}
            size={Math.min(32, Math.round((size as number * 12) / 36))}
          >
            <WarningIconRounded />
          </Circle>
        </Tooltip>
      )}
      {overlayChainLogo && (
        <Circle
          overflow={"hidden"}
          position={"absolute"}
          right={-1}
          top={-1}
          size={Math.min(32, Math.round((size as number * 12) / 24))}
        >
          {originChainIcon()}
        </Circle>
      )}
    </Circle>
  )
}
