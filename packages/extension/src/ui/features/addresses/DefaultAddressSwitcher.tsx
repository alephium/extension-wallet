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
  alwaysShowTitle?: HoverSelectProps['alwaysShowTitle']
  alignText?: HoverSelectProps['alignText']
  className?: string
}

const DefaultAddressSwitcher = ({
  title,
  dimensions,
  addressNameStyle,
  alwaysShowTitle,
  borderRadius,
  alignText,
  className
}: DefaultAddressSwitcherProps) => {
  const { metadata: addressesMetadata } = useAddressMetadata()
  const { addresses, defaultAddress, setDefaultAddress } = useAddresses()

  const handleDefaultAddressSelect = (hash: string) => {
    setDefaultAddress(hash)
  }

  const addressItems: HoverSelectItem[] = addresses.map((address) => {
    const metadata = addressesMetadata[address.hash]

    return {
      Component: (
        <AddressName
          name={metadata.name}
          color={metadata.color}
          isDefault={address.hash === defaultAddress?.hash}
          style={addressNameStyle}
        />
      ),
      value: address.hash
    }
  })

  return (
    <HoverSelect
      items={addressItems}
      title={title || 'Default address'}
      selectedItemValue={defaultAddress?.hash}
      onItemClick={handleDefaultAddressSelect}
      dimensions={dimensions}
      alwaysShowTitle={alwaysShowTitle}
      alignText={alignText}
      className={className}
      borderRadius={borderRadius}
    />
  )
}

export default DefaultAddressSwitcher
