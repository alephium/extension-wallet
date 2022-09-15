import produce from 'immer'
import create from 'zustand'
import { persist } from 'zustand/middleware'

import { AddressMetadata } from '../../../shared/addresses'
import { getRandomLabelColor } from '../../../shared/utils/colors'

export const defaultAddressName = 'Unnamed Address'

interface State {
  metadata: { [addressHash: string]: AddressMetadata }
  setAddressMetadata: (addressHash: string, addressMetadata: Partial<AddressMetadata>) => void
}

export const useAddressMetadata = create<State>(
  persist(
    (set) => ({
      metadata: {},
      setAddressMetadata: (addressHash: string, addressMetadata: Partial<AddressMetadata>) =>
        set(
          produce<State>((state) => {
            state.metadata[addressHash] = { ...state.metadata[addressHash], ...addressMetadata }
          })
        )
    }),
    { name: 'addressMetadata' }
  )
)

export const getAddressName = (address: string, metadata: State['metadata']): string =>
  metadata[address]?.name || defaultAddressName

export const setDefaultAddressesMetadata = (addresses: string[]) => {
  const { metadata } = useAddressMetadata.getState()

  let completedMetadata = addresses.reduce<{ [hash: string]: AddressMetadata }>((acc, a, i) => {
    const m = acc

    if (!metadata[a]?.name) {
      m[a] = { ...metadata[a], name: `Address ${i + 1}` }
    }

    if (!metadata[a]?.color) {
      m[a] = { ...metadata[a], color: getRandomLabelColor() }
    }

    return m
  }, metadata)

  if (Object.keys(completedMetadata).length === 0) {
    completedMetadata = {
      [addresses[0]]: {
        name: `Address 1`,
        color: getRandomLabelColor()
      }
    }
  }

  useAddressMetadata.setState({ metadata: completedMetadata })
}
