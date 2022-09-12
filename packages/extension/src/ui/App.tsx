import 'swiper/css'

import { ThemeProvider as MuiThemeProvider } from '@mui/material'
import { FC, Suspense } from 'react'
import { SWRConfig } from 'swr'

import AppErrorBoundaryFallback from './AppErrorBoundaryFallback'
import { AppRoutes } from './AppRoutes'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingScreen } from './features/actions/LoadingScreen'
import { useExtensionIsInTab } from './features/browser/tabs'
import DevUI from './features/dev/DevUI'
import SoftReloadProvider from './services/resetAndReload'
import { swrCacheProvider } from './services/swr'
import { FixedGlobalStyle, ThemeProvider as StyledComponentsThemeProvider, ThemedGlobalStyle, muiTheme } from './theme'

export const App: FC = () => {
  const extensionIsInTab = useExtensionIsInTab()
  return (
    <SoftReloadProvider>
      <SWRConfig value={{ provider: () => swrCacheProvider }}>
        <MuiThemeProvider theme={muiTheme}>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap"
            rel="stylesheet"
          />
          <FixedGlobalStyle extensionIsInTab={extensionIsInTab} />
          {process.env.SHOW_DEV_UI && <DevUI />}
          <StyledComponentsThemeProvider>
            <ThemedGlobalStyle />
            <ErrorBoundary fallback={<AppErrorBoundaryFallback />}>
              <Suspense fallback={<LoadingScreen />}>
                <AppRoutes />
              </Suspense>
            </ErrorBoundary>
          </StyledComponentsThemeProvider>
        </MuiThemeProvider>
      </SWRConfig>
    </SoftReloadProvider>
  )
}
