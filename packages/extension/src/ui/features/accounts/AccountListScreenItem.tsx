import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Address } from "../../../shared/Address"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { connectAccount } from "../../services/backgroundAccounts"
import { useAddresses } from "../addresses/addresses.state"
import {
  getAddressName,
  useAddressMetadata,
} from "../addresses/addressMetadata.state"
import { AccountListItem } from "./AccountListItem"

interface IAccountListScreenItem {
  address: Address
  selectedAddress?: Address
}

export const AccountListScreenItem: FC<IAccountListScreenItem> = ({
  address,
  selectedAddress,
}) => {
  const navigate = useNavigate()

  const { addressNames } = useAddressMetadata()
  const addressName = getAddressName(address.hash, addressNames)

  return (
    <AccountListItem
      {...makeClickable(() => {
        useAddresses.setState({
          selectedAddress: address,
        })
        connectAccount(address.hash)
        navigate(routes.accountTokens())
      })}
      accountName={addressName}
      accountAddress={address.hash}
      focus={selectedAddress?.hash === address.hash}
    />
  )
}
