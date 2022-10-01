import { ComponentProps } from 'react'

import AddressName from '../../components/AddressName'
import HoverSelect, { HoverSelectItem } from '../../components/HoverSelect'
import { useAddresses } from './addresses.state'
import { useAddressMetadata } from './addressMetadata.state'

type HoverSelectProps = ComponentProps<typeof HoverSelect>

interface DefaultAddressSwitcherProps {
  title?: string
  dimensions?: HoverSelectProps['dimensions']
  addressNameStyle?: ComponentProps<typeof AddressName>['style']
  borderRadius?: HoverSelectProps['borderRadius']
  className?: string
}

const DefaultAddressSwitcher = ({
  title,
  dimensions,
  addressNameStyle,
  borderRadius,
  className
}: DefaultAddressSwitcherProps) => {
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
      title={title || 'Default address'}
      selectedItemValue={defaultAddress?.hash}
      onItemClick={handleDefaultAddressSelect}
      dimensions={dimensions}
      className={className}
      borderRadius={borderRadius}
    />
  )
}

export default DefaultAddressSwitcher
