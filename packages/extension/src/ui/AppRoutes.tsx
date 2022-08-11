import { FC } from "react"
import { Outlet, Route, Routes } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "./app.state"
import { AddressListScreen } from "./features/addresses/AddressListScreen"
import { AddressScreen } from "./features/addresses/AddressScreen"
import { SendTokenScreen } from "./features/addressTokens/SendTokenScreen"
import {
  useActions,
  useActionsSubscription,
} from "./features/actions/actions.state"
import { ActionScreen } from "./features/actions/ActionScreen"
import { ErrorScreen } from "./features/actions/ErrorScreen"
import { LoadingScreen } from "./features/actions/LoadingScreen"
import { LockScreen } from "./features/onboarding/LockScreen"
import { NewWalletScreen } from "./features/onboarding/NewWalletScreen"
import { ResetScreen } from "./features/onboarding/ResetScreen"
import { WelcomeScreen } from "./features/onboarding/WelcomeScreen"
import { SeedRecoveryPasswordScreen } from "./features/recovery/SeedRecoveryPasswordScreen"
import { SeedRecoveryScreen } from "./features/recovery/SeedRecoveryScreen"
import { DappConnectionsSettingsScreen } from "./features/settings/DappConnectionsSettingsScreen"
import { NetworkSettingsEditScreen } from "./features/settings/NetworkSettingsEditScreen"
import { NetworkSettingsFormScreen } from "./features/settings/NetworkSettingsFormScreen"
import { NetworkSettingsScreen } from "./features/settings/NetworkSettingsScreen"
import { SeedSettingsScreen } from "./features/settings/SeedSettingsScreen"
import { SettingsScreen } from "./features/settings/SettingsScreen"
import { routes } from "./routes"
import { useEntryRoute } from "./useEntryRoute"

export const ScrollBehaviour = styled.div`
  height: 100vh;
  overflow-y: auto;

  overscroll-behavior: none;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`

export const ResponsiveBehaviour = styled.div`
  ${({ theme }) => theme.mediaMinWidth.sm`
    margin: 0 ${theme.margin.extensionInTab};
  `}
`

const Viewport: FC = () => (
  <ScrollBehaviour>
    <ResponsiveBehaviour>
      <Outlet />
    </ResponsiveBehaviour>
  </ScrollBehaviour>
)

// Routes which don't need an unlocked wallet
const nonWalletRoutes = (
  <>
    <Route path={routes.welcome.path} element={<WelcomeScreen />} />
    <Route path={routes.newWallet.path} element={<NewWalletScreen />} />
    <Route path={routes.seedRecovery.path} element={<SeedRecoveryScreen />} />
    <Route
      path={routes.seedRecoveryPassword.path}
      element={<SeedRecoveryPasswordScreen />}
    />
    <Route path={routes.lockScreen.path} element={<LockScreen />} />
    <Route path={routes.reset.path} element={<ResetScreen />} />
    <Route path={routes.error.path} element={<ErrorScreen />} />
  </>
)

// Routes which need an unlocked wallet and therefore can also sign actions
const walletRoutes = (
  <>
    <Route
      path={routes.addressTokens.path}
      element={<AddressScreen tab="assets" />}
    />
    <Route
      path={routes.addressActivity.path}
      element={<AddressScreen tab="activity" />}
    />
    <Route path={routes.sendToken.path} element={<SendTokenScreen />} />
    <Route path={routes.addresses.path} element={<AddressListScreen />} />
    <Route path={routes.settings.path} element={<SettingsScreen />} />
    <Route path={routes.settingsSeed.path} element={<SeedSettingsScreen />} />
    <Route
      path={routes.settingsNetworks.path}
      element={<NetworkSettingsScreen />}
    />
    <Route
      path={routes.settingsAddCustomNetwork.path}
      element={<NetworkSettingsFormScreen mode="add" />}
    />
    <Route
      path={routes.settingsEditCustomNetwork.path}
      element={<NetworkSettingsEditScreen />}
    />
    <Route
      path={routes.settingsDappConnections.path}
      element={<DappConnectionsSettingsScreen />}
    />
  </>
)

export const AppRoutes: FC = () => {
  useEntryRoute()
  useActionsSubscription()

  const { isLoading } = useAppState()
  const { actions } = useActions()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route element={<Viewport />}>
        {nonWalletRoutes}
        {actions[0] ? (
          <Route path="*" element={<ActionScreen />} />
        ) : (
          walletRoutes
        )}
      </Route>
    </Routes>
  )
}
