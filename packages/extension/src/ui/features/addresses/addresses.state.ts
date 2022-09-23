import create from 'zustand'

import { Address } from '../../../shared/addresses'

interface State {
  addresses: Address[]
  defaultAddress?: Address
  addAddress: (newAddress: Address) => void
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
    }))
}))

export const useDefaultAddress = () => useAddresses(({ defaultAddress }) => defaultAddress)
