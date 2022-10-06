import create from 'zustand'

interface State {
  headerTitle?: string
}

const initialState = {
  headerTitle: ''
}

export const useWalletState = create<State>(() => ({
  ...initialState
}))
