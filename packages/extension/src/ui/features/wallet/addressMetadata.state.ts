import create from "zustand"
import { persist } from "zustand/middleware"

export const defaultAddressName = "Unnamed Address"

interface State {
  addressNames: Record<string, string>
  setAddressName: (address: string, name: string) => void
}

export const useAddressMetadata = create<State>(
  persist(
    (set, _get) => ({
      addressNames: {},
      setAddressName: (address: string, name: string) =>
        set((state) => ({
          addressNames: {
            ...state.addressNames,
            [address]: name,
          },
        })),
    }),
    { name: "addressMetadata" },
  ),
)

export const getAddressName = (
  address: string,
  addressNames: Record<string, string>,
): string => addressNames[address] || defaultAddressName

export const setDefaultAddressNames = (addresses: string[]) => {
  const { addressNames } = useAddressMetadata.getState()
  let names = addressNames
  for (const address of addresses) {
    if (!names[address]) {
      const name = `Address ${addresses.indexOf(address) + 1}`
      names = {
        ...names,
        [address]: name,
      }
    }
  }
  useAddressMetadata.setState({ addressNames: names })
}
