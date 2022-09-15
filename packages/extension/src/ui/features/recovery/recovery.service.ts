import { To } from 'react-router-dom'

import { useAppState } from '../../app.state'
import { routes } from '../../routes'
import { getAddresses, getLastSelectedAddress } from '../../services/backgroundAddresses'
import { toAddress } from '../addresses/addresses.service'
import { useAddresses } from '../addresses/addresses.state'
import { setDefaultAddressesMetadata } from '../addresses/addressMetadata.state'

export const recover = async (targetRoute: To) => {
  try {
    const lastSelectedAddress = await getLastSelectedAddress()
    const selectedAddress = lastSelectedAddress && toAddress(lastSelectedAddress)
    const addresses = (await getAddresses()).map((addr) => toAddress(addr))

    setDefaultAddressesMetadata(addresses.map((addr) => addr.hash))
    useAddresses.setState({ addresses, selectedAddress })
    return targetRoute
  } catch (e: any) {
    console.error('Recovery error:', e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}
