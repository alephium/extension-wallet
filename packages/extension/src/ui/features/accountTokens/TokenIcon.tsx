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
  url?: string
  verified?: boolean
  originChain?: string
}

export const getTokenIconUrl = ({
  url,
  name,
}: Pick<TokenIconProps, "url" | "name">) => {
  if (url && url.length) {
    return url
  }
  const background = getColor(name)
  return generateAvatarImage(name, { background })
}

export const TokenIcon: FC<TokenIconProps> = ({ name, url, size, verified, originChain, ...rest }) => {
  const src = getTokenIconUrl({ url, name })

  const originChainIcon = () => {
    if (!originChain || !verified) {
      return undefined
    }

    switch (originChain.toLowerCase()) {
      case 'bsc':
        return <BSCIcon />
      case 'ethereum':
        return <EthereumIcon />
      default:
        return undefined
    }
  }

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
      {(originChain && verified) && (
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
