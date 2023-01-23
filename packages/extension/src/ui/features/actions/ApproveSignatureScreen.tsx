import { FC } from "react"
import type { typedData } from "starknet"
import styled from "styled-components"

import { usePageTracking } from "../../services/analytics"
import { P } from "../../theme/Typography"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useFeeTokenBalance } from "../accountTokens/tokens.service"
import {
  ConfirmPageProps,
  DeprecatedConfirmScreen,
} from "./DeprecatedConfirmScreen"

interface ApproveSignatureScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  dataToSign: typedData.TypedData
  onSubmit: (data: typedData.TypedData) => void
}

export const Pre = styled.pre`
  margin-top: 24px;
  padding: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.15);
  max-width: calc(100vw - 64px);
  overflow: auto;
`

export const ApproveSignatureScreen: FC<ApproveSignatureScreenProps> = ({
  dataToSign,
  onSubmit,
  selectedAccount,
  ...props
}) => {
  usePageTracking("signMessage")

  const { feeTokenBalance } = useFeeTokenBalance(selectedAccount)
  const { pendingTransactions = [] } = useAccountTransactions(selectedAccount)

  return (
    <DeprecatedConfirmScreen
      title="Sign message"
      confirmButtonText="Sign"
      onSubmit={() => {
        onSubmit(dataToSign)
      }}
      {...props}
    >
      <P>A dapp wants you to sign this message:</P>
      <Pre>{JSON.stringify(dataToSign, null, 2)}</Pre>
    </DeprecatedConfirmScreen>
  )
}
