import {
  BarIconButton,
  NavigationBar,
  NavigationBarProps,
  icons,
} from "@argent/ui"
import { Button, Flex, Text } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { NetworkSwitcher } from "../networks/NetworkSwitcher"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { Account } from "../accounts/Account"
import { SyncRounded } from "@mui/icons-material"
import { useFungibleTokensWithBalance } from "../accountTokens/tokens.state"
import { useTranslation } from "react-i18next"

const { SettingsIcon, DropdownDownIcon } = icons

export interface AccountNavigationBarProps
  extends Pick<NavigationBarProps, "scroll"> {
  account?: Account
  showAccountButton?: boolean
}

export const AccountNavigationBar: FC<AccountNavigationBarProps> = ({
  account,
  scroll,
  showAccountButton = true,
}) => {
  const { t } = useTranslation()
  const { accountNames } = useAccountMetadata()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = useCurrentPathnameWithQuery()
  const { mutate } = useFungibleTokensWithBalance(account)
  const openAccountList = useCallback(() => {
    navigate(routes.accounts(location.pathname))
  }, [location.pathname, navigate])

  const showSettings = useCallback(() => {
    navigate(routes.settings(returnTo))
  }, [navigate, returnTo])

  const accountName = account && getAccountName(account, accountNames)
  return (
    <NavigationBar scroll={scroll}>
      {showAccountButton && account && (
        <Button
          aria-label={t("Show account list")}
          colorScheme={"neutrals"}
          size={"2xs"}
          onClick={openAccountList}
        >
          <Text noOfLines={1} maxW={"180px"}>
            {accountName}
          </Text>
          <Text fontSize={"2xs"} ml={1}>
            <DropdownDownIcon />
          </Text>
        </Button>
      )}
        <BarIconButton
          ml={1}
          aria-label={t("Sync account")}
          onClick={() => { mutate() }}
          colorScheme={"neutrals"}
        >
          <SyncRounded fontSize="small"/>
        </BarIconButton>
      <Flex ml={"auto"}>
        <NetworkSwitcher />
        <BarIconButton
          ml={1}
          aria-label={t("Show settings")}
          onClick={showSettings}
          colorScheme={"neutrals"}
        >
          <SettingsIcon />
        </BarIconButton>
      </Flex>
    </NavigationBar>
  )
}
