import { Circle, Image, Tooltip } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import { generateAvatarImage } from "../../../shared/avatarImage"
import { WarningIconRounded } from "../../components/Icons/WarningIconRounded"
import { getColor } from "../accounts/accounts.service"

export interface TokenIconProps
  extends Pick<ComponentProps<typeof Circle>, "size">,
  ComponentProps<typeof Image> {
  name: string
  url?: string
  verified?: boolean
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

export const TokenIcon: FC<TokenIconProps> = ({ name, url, size, verified, ...rest }) => {
  const src = getTokenIconUrl({ url, name })
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
        <Tooltip label={"Unverified Token"} shouldWrapChildren={true}>
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
    </Circle>
  )
}
