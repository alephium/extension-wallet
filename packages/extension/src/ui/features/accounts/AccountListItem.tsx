import { groupOfAddress, KeyType } from "@alephium/web3"
import { H6, L2, P4, icons, typographyStyles } from "@argent/ui"
import { Circle, Flex, Image, Text, Tooltip, chakra } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import { SignerType } from "../../../shared/wallet.model"
import {
  CustomButtonCell,
  CustomButtonCellProps,
} from "../../components/CustomButtonCell"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { formatTruncatedAddress } from "../../services/addresses"
import { getNetworkAccountImageUrl } from "./accounts.service"
import { useTranslation } from "react-i18next"

const { LinkIcon, ViewIcon, UpgradeIcon } = icons

export interface AccountListItemProps extends CustomButtonCellProps {
  accountName: string
  accountAddress: string
  networkId: string
  keyType?: KeyType
  signerType?: SignerType
  networkName?: string
  deploying?: boolean
  upgrade?: boolean
  connectedHost?: string
  hidden?: boolean
  avatarOutlined?: boolean
}

interface AccountAvatarProps extends ComponentProps<"img"> {
  outlined?: boolean
}

export const AccountAvatar: FC<AccountAvatarProps> = ({
  outlined,
  children,
  ...rest
}) => {
  return (
    <Flex position={"relative"} flexShrink={0}>
      <Image borderRadius={"full"} width={12} height={12} {...rest} />
      {outlined && (
        <>
          <Circle
            position={"absolute"}
            top={0}
            size={12}
            borderWidth={"0.25rem"}
            borderColor={"black"}
          />
          <Circle
            position={"absolute"}
            top={0}
            size={12}
            borderWidth={"0.125rem"}
            borderColor={"white"}
          />
        </>
      )}
      {children}
    </Flex>
  )
}

const NetworkStatusWrapper = chakra(Flex, {
  baseStyle: {
    alignItems: "center",
    justifyContent: "right",
    gap: 1,
    ml: 1,
    pointerEvents: "none",
    ...typographyStyles.L1,
  },
})

export const AccountListItemUpgradeBadge: FC = () => {
  const { t } = useTranslation()
  return (
    <Tooltip label={t("This account needs to be upgraded")}>
      <Circle
        position={"absolute"}
        right={-0.5}
        bottom={-0.5}
        size={5}
        bg={"primary.500"}
        border={"2px solid"}
        borderColor={"neutrals.800"}
        color={"neutrals.800"}
        fontSize={"2xs"}
      >
        <UpgradeIcon />
      </Circle>
    </Tooltip>
  )
}

export const AccountListItem: FC<AccountListItemProps> = ({
  accountName,
  accountAddress,
  networkId,
  networkName,
  signerType,
  keyType,
  deploying,
  upgrade,
  connectedHost,
  hidden,
  avatarOutlined,
  children,
  ...rest
}) => {
  const { t } = useTranslation()
  const avatarBadge = upgrade ? <AccountListItemUpgradeBadge /> : null
  return (
    <CustomButtonCell {...rest}>
      <AccountAvatar
        outlined={avatarOutlined}
        src={getNetworkAccountImageUrl({
          accountName,
          accountAddress,
          networkId,
          backgroundColor: hidden ? "333332" : undefined,
        })}
      >
        {avatarBadge}
      </AccountAvatar>
      <Flex
        flex={1}
        overflow={"hidden"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Flex direction={"column"} overflow={"hidden"}>
          <Flex gap={1} alignItems={"center"}>
            <H6 overflow={"hidden"} textOverflow={"ellipsis"}>
              {accountName}
            </H6>
            {signerType === "ledger" && (
              <L2
                backgroundColor={"neutrals.900"}
                px={1}
                py={0.5}
                textTransform="uppercase"
                fontWeight={"extrabold"}
                color={"neutrals.200"}
                borderRadius={"base"}
                border={"1px solid"}
                borderColor={"neutrals.700"}
              >
                {t("Ledger")}
              </L2>
            )}
            {keyType === "bip340-schnorr" && (
              <L2
                backgroundColor={"neutrals.900"}
                px={1}
                py={0.5}
                textTransform="uppercase"
                fontWeight={"extrabold"}
                color={"neutrals.200"}
                borderRadius={"base"}
                border={"1px solid"}
                borderColor={"neutrals.700"}
              >
                {t("Schnorr")}
              </L2>
            )}
          </Flex>
          <Flex gap={2} color={"neutrals.300"}>
            <P4 fontWeight={"semibold"}>
              {formatTruncatedAddress(accountAddress)} / {t("Group")}:{groupOfAddress(accountAddress)}
            </P4>
          </Flex>
        </Flex>
        <Flex direction={"column"}>
          {deploying ? (
            <NetworkStatusWrapper>
              <TransactionStatusIndicator color="orange" />
              {t("Deploying")}
            </NetworkStatusWrapper>
          ) : connectedHost ? (
            <Tooltip label={`Connected to ${connectedHost}`}>
              <Circle size={8} bg={"neutrals.900"}>
                <Circle size={6} bg={"secondary.500"} color={"white"}>
                  <LinkIcon />
                </Circle>
              </Circle>
            </Tooltip>
          ) : (
            hidden && (
              <Circle size={10} bg={"neutrals.600"}>
                <Text fontSize={"2xl"}>
                  <ViewIcon />
                </Text>
              </Circle>
            )
          )}
          {children}
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
