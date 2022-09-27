import AddressName from '../../components/AddressName'
import HoverSelect, { HoverSelectItem } from '../../components/HoverSelect'
import { useAddressMetadata } from './addressMetadata.state'

const DefaultAddressSwitcher = () => {
  const { metadata: addressesMetadata } = useAddressMetadata()

  const handleDefaultAddressSelect = (hash: string) => {
    console.log('SELECT ' + hash)
  }

  const addresses: HoverSelectItem[] = Object.entries(addressesMetadata).map(([k, v], i) => ({
    Component: <AddressName name={v.name} color={v.color} isDefault={i === 0} />,
    value: k,
    onClick: () => handleDefaultAddressSelect(k)
  }))

  return <HoverSelect items={addresses} />
}

export default DefaultAddressSwitcher
