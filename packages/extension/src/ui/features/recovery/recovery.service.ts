import { useAppState } from '../../app.state'
import { routes } from '../../routes'
import { getAddresses, getLastSelectedAddress } from '../../services/backgroundAddresses'
import { toAddress } from '../wallet/addresses.service'
import { useAddresses } from '../wallet/addresses.state'
import { setDefaultAddressNames } from '../wallet/addressMetadata.state'

export const recover = async () => {
  try {
    const lastSelectedAddress = await getLastSelectedAddress()
    const selectedAddress = lastSelectedAddress && toAddress(lastSelectedAddress)
    const addresses = (await getAddresses()).map((addr) => toAddress(addr))

    setDefaultAddressNames(addresses.map((addr) => addr.hash))
    useAddresses.setState({ addresses, selectedAddress })
    return routes.addressTokens()
  } catch (e: any) {
    console.error('Recovery error:', e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}
