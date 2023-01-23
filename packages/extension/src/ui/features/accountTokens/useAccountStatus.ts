import { isFunction } from "lodash-es"
import { useEffect, useMemo } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Account } from "../accounts/Account"
import { AccountStatus, getStatus } from "../accounts/accounts.service"
import { useTransactionStatus } from "./useTransactionStatus"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ERROR_STATUS: AccountStatus = {
  code: "ERROR",
  text: "Deployment failed",
}

export const useAccountStatus = (
  account: Account,
  activeAccount?: BaseWalletAccount,
) => {
  return useMemo(() => {
    return getStatus(account, activeAccount)
  }, [account, activeAccount])
}
