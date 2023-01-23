import { FC, useState } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { AccountAddress } from "./AccountAddress"
import {
  ConfirmPageProps,
  DeprecatedConfirmScreen,
} from "./DeprecatedConfirmScreen"
import { AccountDeploymentFeeEstimation } from "./feeEstimation/AccountDeploymentFeeEstimation"

export interface ApproveDeployAccountScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  onSubmit: () => void
}

export const ApproveDeployAccountScreen: FC<
  ApproveDeployAccountScreenProps
> = ({ selectedAccount, actionHash, onSubmit, ...props }) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(false)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <DeprecatedConfirmScreen
      title="Review activation"
      confirmButtonText="Approve"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={onSubmit}
      showHeader={false}
      {...props}
    >
      <AccountAddress selectedAccount={selectedAccount} />
    </DeprecatedConfirmScreen>
  )
}
