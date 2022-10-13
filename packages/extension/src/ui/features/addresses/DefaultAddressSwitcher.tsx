import { ComponentProps, useEffect, useState } from 'react'

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
  setSelectedAsDefault?: boolean
  selectedAddressHash?: string
  onAddressSelect?: (hash: string) => void
  className?: string
}

const DefaultAddressSwitcher = ({
  title,
  dimensions,
  addressNameStyle,
  alwaysShowTitle,
  borderRadius,
  alignText,
  setSelectedAsDefault,
  selectedAddressHash,
  onAddressSelect,
  className
}: DefaultAddressSwitcherProps) => {
  const { metadata: addressesMetadata } = useAddressMetadata()
  const { addresses, defaultAddress, setDefaultAddress } = useAddresses()
  const [selectedAddress, setSelectedAddress] = useState(selectedAddressHash || defaultAddress?.hash)

  const handleOnItemClick = (hash: string) => {
    if (setSelectedAsDefault && defaultAddress && defaultAddress.hash !== hash) {
      setDefaultAddress(hash)
    }
    if (selectedAddress !== hash) {
      setSelectedAddress(hash)
      onAddressSelect && onAddressSelect(hash)
    }
  }

  // Set as default on first render
  useEffect(() => {
    if (selectedAddressHash) {
      handleOnItemClick(selectedAddressHash)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  if (!selectedAddress) {
    return null
  }

  return (
    <HoverSelect
      items={addressItems}
      title={title || 'Default address'}
      selectedItemValue={selectedAddress}
      onItemClick={handleOnItemClick}
      dimensions={dimensions}
      alwaysShowTitle={alwaysShowTitle}
      alignText={alignText}
      className={className}
      borderRadius={borderRadius}
    />
  )
}

export default DefaultAddressSwitcher
