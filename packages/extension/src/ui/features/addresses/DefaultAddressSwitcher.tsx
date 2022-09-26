import HoverSelect, { HoverSelectItem } from '../../components/HoverSelect'
import { useAddressMetadata } from './addressMetadata.state'

const DefaultAddressSwitcher = () => {
  const { metadata: addressesMetadata } = useAddressMetadata()

  const handleDefaultAddressSelect = (hash: string) => {
    console.log('SELECT ' + hash)
  }

  const addresses: HoverSelectItem[] = Object.entries(addressesMetadata).map(([k, v]) => ({
    label: v.name,
    value: k,
    color: v.color,
    onClick: () => handleDefaultAddressSelect(k)
  }))

  return <HoverSelect items={addresses} />
}

export default DefaultAddressSwitcher
