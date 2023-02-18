import { SignMessageParams } from "@alephium/web3"
import { FC } from "react"
import styled from "styled-components"

import { usePageTracking } from "../../services/analytics"
import { P } from "../../theme/Typography"
import {
  ConfirmPageProps,
  DeprecatedConfirmScreen,
} from "./DeprecatedConfirmScreen"
import { Field, FieldGroup, FieldKey, FieldValue, SectionHeader } from "../../components/Fields"
import { AccountAddressField } from "./transaction/fields/AccountAddressField"

interface ApproveSignatureScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  dataToSign: SignMessageParams
  onSubmit: (data: SignMessageParams) => void
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

  return (
    <DeprecatedConfirmScreen
      title="Sign message"
      confirmButtonText="Sign"
      onSubmit={() => {
        onSubmit(dataToSign)
      }}
      {...props}
    >
      { selectedAccount &&
        <FieldGroup>
          <AccountAddressField
            title="Signer"
            accountAddress={selectedAccount.address}
            networkId={selectedAccount.networkId}
          />
          <Field>
            <FieldKey>Network</FieldKey>
            <FieldValue>{selectedAccount.networkName}</FieldValue>
          </Field>
          <SectionHeader>Message</SectionHeader>
          <Field>
            <P>{dataToSign.message}</P>
          </Field>
        </FieldGroup>
      }
    </DeprecatedConfirmScreen>
  )
}
