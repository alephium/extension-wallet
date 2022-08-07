import create from "zustand"

import { Address } from "../../../shared/Address"

interface State {
  addresses: Address[]
  selectedAddress?: Address
  addAddress: (newAddress: Address) => void
}

export const initialState = {
  addresses: [],
  selectedAddress: undefined,
}

export const useAddresses = create<State>((set) => ({
  ...initialState,
  addAddress: (newAddress: Address) =>
    set((state) => ({
      selectedAddress: newAddress,
      addresses: [...state.addresses, newAddress],
    })),
}))

export const useSelectedAddress = () =>
  useAddresses(({ selectedAddress }) => selectedAddress)
