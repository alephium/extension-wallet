import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { delay } from "../shared/utils/delay"
import { IS_DEV } from "../shared/utils/dev"
import { useAppState } from "./app.state"
import { recover } from "./features/recovery/recovery.service"
import { routes } from "./routes"
import { hasActiveSession, isInitialized } from "./services/backgroundSessions"
import { getInitialHardReloadRoute } from "./services/resetAndReload"

export const useEntryRoute = () => {
  const navigate = useNavigate()
  const { isFirstRender } = useAppState()

  useEffect(() => {
    ;(async () => {
      if (isFirstRender) {
        const query = new URLSearchParams(window.location.search)
        const entry = await determineEntry(query)
        useAppState.setState({ isLoading: false, isFirstRender: false })
        navigate(entry, { replace: true })
        if (IS_DEV) {
          const initialRoute = getInitialHardReloadRoute(query)
          if (initialRoute) {
            await delay(0)
            navigate(initialRoute, { replace: true })
          }
        }
      }
    })()
  }, [isFirstRender, navigate])
}

const determineEntry = async (query: URLSearchParams) => {
  if (query.get("goto") === "ledger") {
    return routes.ledgerEntry(query.get("networkId") ?? '', query.get("group") ?? undefined, query.get("keyType") ?? "default")
  }

  const { initialized } = await isInitialized()
  if (!initialized) {
    return routes.onboardingStart()
  }

  const hasSession = await hasActiveSession()
  if (hasSession) {
    const url = window.location.href
    return recover()
  }
  return routes.lockScreen()
}
