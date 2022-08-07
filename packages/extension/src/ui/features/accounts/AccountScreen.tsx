import { FC, ReactNode } from "react"

import { assertNever } from "../../services/assertNever"
import { AccountActivity } from "../accountActivity/AccountActivity"
import { AccountTokens } from "../accountTokens/AccountTokens"
import { useSelectedAddress } from "../addresses/addresses.state"
import { AccountContainer } from "./AccountContainer"

interface AccountScreenProps {
  tab: "assets" | "activity"
}

export const AccountScreen: FC<AccountScreenProps> = ({ tab }) => {
  const address = useSelectedAddress()

  let body: ReactNode
  if (!address) {
    body = <></>
  } else if (tab === "assets") {
    body = <AccountTokens address={address} />
  } else if (tab === "activity") {
    body = <AccountActivity address={address} />
  } else {
    assertNever(tab)
  }

  return <AccountContainer>{body}</AccountContainer>
}
