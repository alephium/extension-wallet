import create from 'zustand'

import { Address } from '../../../shared/addresses'
import { connectAddress } from '../../services/backgroundAddresses'

interface State {
  addresses: Address[]
  defaultAddress?: Address
  addAddress: (newAddress: Address) => void
  setDefaultAddress: (hash: string) => void
}

export const initialState = {
  addresses: [],
  defaultAddress: undefined
}

export const useAddresses = create<State>()((set) => ({
  ...initialState,
  addAddress: (newAddress: Address) =>
    set((state) => ({
      addresses: [...state.addresses, newAddress]
    })),
  setDefaultAddress: (hash: string) => {
    set((state) => {
      const defaultAddress = state.addresses.find((a) => a.hash === hash)

      if (!defaultAddress) {
        return state
      }

      connectAddress({
        address: defaultAddress.hash,
        publicKey: defaultAddress.publicKey,
        addressIndex: defaultAddress.index,
        derivationPath: defaultAddress.deviationPath
      })

      return {
        ...state,
        defaultAddress
      }
    })
  }
}))

export const useDefaultAddress = () => useAddresses(({ defaultAddress }) => defaultAddress)
