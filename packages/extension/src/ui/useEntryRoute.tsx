import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppState } from './app.state'
import { recover } from './features/recovery/recovery.service'
import { routes } from './routes'
import { hasActiveSession, isInitialized } from './services/backgroundSessions'

export const useEntryRoute = () => {
  const navigate = useNavigate()
  const { isFirstRender } = useAppState()

  useEffect(() => {
    ;(async () => {
      if (isFirstRender) {
        const entry = await determineEntry()
        useAppState.setState({ isLoading: false, isFirstRender: false })
        navigate(entry)
      }
    })()
  }, [isFirstRender, navigate])
}

const determineEntry = async () => {
  const { initialized } = await isInitialized()
  if (!initialized) {
    return routes.welcome()
  }

  const hasSession = await hasActiveSession()
  if (hasSession) {
    const url = window.location.href
    if (url.includes('wallet/connect-ledger')) {
      return url.split('#/')[1]
    } else {
      return recover(routes.addressTokens.path)
    }
  }
  return routes.lockScreen()
}
