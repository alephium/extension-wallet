import {
  ScrollContainer,
  Tab,
  TabBar,
  icons,
  useScrollRestoration,
} from "@argent/ui"
import { FC, PropsWithChildren } from "react"
import { NavLink } from "react-router-dom"

import { routes } from "../../routes"
import { AccountNavigationBar } from "./AccountNavigationBar"
import { useAccountTransactions } from "./accountTransactions.state"
import { Account } from "../accounts/Account"

const { WalletIcon, NftIcon, ActivityIcon } = icons

export interface AccountContainerProps extends PropsWithChildren {
  account: Account
  scrollKey: string
}

export const AccountContainer: FC<AccountContainerProps> = ({
  account,
  scrollKey,
  children,
}) => {
  const { pendingTransactions } = useAccountTransactions(account)
  const { scrollRef, scroll } = useScrollRestoration(scrollKey)

  if (!account) {
    return <></>
  }

  return (
    <>
      <AccountNavigationBar scroll={scroll} account={account} />
      <ScrollContainer ref={scrollRef}>{children}</ScrollContainer>
      <TabBar>
        <Tab
          as={NavLink}
          to={routes.accountTokens()}
          replace
          icon={<WalletIcon />}
          label="Tokens"
        />
        <Tab
          as={NavLink}
          to={routes.accountCollections()}
          replace
          icon={<NftIcon />}
          label="Collections"
        />
        <Tab
          as={NavLink}
          to={routes.accountActivity()}
          replace
          icon={<ActivityIcon />}
          badgeLabel={pendingTransactions.length}
          badgeDescription={"Pending transactions"}
          label="Activity"
        />
      </TabBar>
    </>
  )
}
