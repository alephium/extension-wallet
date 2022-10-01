import { ComponentProps } from 'react'

import AddressName from '../../components/AddressName'
import HoverSelect, { HoverSelectItem } from '../../components/HoverSelect'
import { useAddresses } from './addresses.state'
import { useAddressMetadata } from './addressMetadata.state'

interface DefaultAddressSwitcherProps {
  dimensions: ComponentProps<typeof HoverSelect>['dimensions']
  addressNameStyle?: ComponentProps<typeof AddressName>['style']
  className?: string
}

const DefaultAddressSwitcher = ({ dimensions, addressNameStyle, className }: DefaultAddressSwitcherProps) => {
  const { metadata: addressesMetadata } = useAddressMetadata()
  const { defaultAddress, setDefaultAddress } = useAddresses()

  const handleDefaultAddressSelect = (hash: string) => {
    setDefaultAddress(hash)
  }

  const addressItems: HoverSelectItem[] = Object.entries(addressesMetadata).map(([k, v]) => ({
    Component: (
      <AddressName name={v.name} color={v.color} isDefault={k === defaultAddress?.hash} style={addressNameStyle} />
    ),
    value: k
  }))

  return (
    <HoverSelect
      items={addressItems}
      title="Default address"
      selectedItemValue={defaultAddress?.hash}
      onItemClick={handleDefaultAddressSelect}
      dimensions={dimensions}
      className={className}
    />
  )
}

export default DefaultAddressSwitcher
