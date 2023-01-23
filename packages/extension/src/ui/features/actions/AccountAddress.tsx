import { FC } from "react"

import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { Account } from "../accounts/Account"
import { AccountAddressField } from "./transaction/fields/AccountAddressField"

const AccountAddress: FC<{ selectedAccount: Account }> = ({
  selectedAccount,
}) => (
  <FieldGroup>
    <AccountAddressField
      title="From"
      accountAddress={selectedAccount.address}
      networkId={selectedAccount.networkId}
    />
    <Field>
      <FieldKey>Network</FieldKey>
      <FieldValue>{selectedAccount.networkName}</FieldValue>
    </Field>
  </FieldGroup>
)

export { AccountAddress }
