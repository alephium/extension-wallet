import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Address } from "../../../shared/Address"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { connectAddress } from "../../services/backgroundAddresses"
import { useAddresses } from "../addresses/addresses.state"
import {
  getAddressName,
  useAddressMetadata,
} from "../addresses/addressMetadata.state"
import { AddressListItem } from "./AddressListItem"

interface IAddressListScreenItem {
  address: Address
  selectedAddress?: Address
}

export const AddressListScreenItem: FC<IAddressListScreenItem> = ({
  address,
  selectedAddress,
}) => {
  const navigate = useNavigate()

  const { addressNames } = useAddressMetadata()
  const addressName = getAddressName(address.hash, addressNames)

  return (
    <AddressListItem
      {...makeClickable(() => {
        useAddresses.setState({
          selectedAddress: address,
        })
        connectAddress(address.hash)
        navigate(routes.addressTokens())
      })}
      addressName={addressName}
      address={address.hash}
      focus={selectedAddress?.hash === address.hash}
    />
  )
}
