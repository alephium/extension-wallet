import { To } from 'react-router-dom'

import { useAppState } from '../../app.state'
import { routes } from '../../routes'
import { getAddresses, getLastDefaultAddress } from '../../services/backgroundAddresses'
import { toAddress } from '../addresses/addresses.service'
import { useAddresses } from '../addresses/addresses.state'
import { setDefaultAddressesMetadata } from '../addresses/addressMetadata.state'

export const recover = async (targetRoute: To) => {
  try {
    const lastDefaultAddress = await getLastDefaultAddress()
    const defaultAddress = lastDefaultAddress && toAddress(lastDefaultAddress)
    const addresses = (await getAddresses()).map((addr) => toAddress(addr))

    setDefaultAddressesMetadata(addresses.map((addr) => addr.hash))
    useAddresses.setState({ addresses, defaultAddress })
    return targetRoute
  } catch (e: any) {
    console.error('Recovery error:', e)
    useAppState.setState({ error: `${e}` })
    return routes.error()
  }
}
