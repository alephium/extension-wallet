import create from 'zustand'
import { persist } from 'zustand/middleware'

import { defaultNetwork } from '../../../shared/networks'
import { setCurrentNetwork } from '../../services/backgroundNetworks'

interface State {
  switcherNetworkId: string
  setSwitcherNetworkId: (networkId: string) => void
}

export const useNetworkState = create<State>()(
  persist(
    (set, _get) => ({
      switcherNetworkId: defaultNetwork.id,
      setSwitcherNetworkId: async (networkId: string) => {
        await setCurrentNetwork(networkId)
        return set((state) => ({
          ...state,
          switcherNetworkId: networkId
        }))
      }
    }),
    { name: 'networkState' }
  )
)
