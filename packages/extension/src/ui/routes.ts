import { isString } from 'lodash-es'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const route = <T extends (..._: any[]) => string>(
  ...[value, path]: [routeAndPath: string] | [routeWithParams: T, path: string]
): T & { path: string } => {
  if (isString(value)) {
    return Object.defineProperty((() => value) as any, 'path', { value })
  }
  return Object.defineProperty(value as any, 'path', { value: path })
}

/** a route function with a `returnTo` query parameter */

export const routeWithReturnTo = (route: string) => {
  const returnTo = (returnTo?: string) => (returnTo ? `${route}?returnTo=${encodeURIComponent(returnTo)}` : route)
  returnTo.path = route
  return returnTo
}

/** hook that builds on useLocation to parse query string */

export const useQuery = () => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

/** hook to get the `returnTo` query parameter */

export const useReturnTo = () => {
  /** get() returns null for missing value, cleaner to return undefined */
  return useQuery().get('returnTo') || undefined
}

export const routes = {
  welcome: route('/index.html'),
  newWallet: route('/wallets/new'),
  backupRecovery: route('/recover/backup'),
  seedRecovery: route('/recover/seed'),
  seedRecoveryPassword: route('/recover/seed/password'),
  setupRecovery: routeWithReturnTo('/recovery'),
  setupSeedRecovery: routeWithReturnTo('/recovery/seed'),
  confirmSeedRecovery: routeWithReturnTo('/recovery/seed/confirm'),
  lockScreen: route('/lock-screen'),
  addressTokens: route('/address/tokens'),
  walletAddresses: route('/wallet/addresses'),
  newAddress: route('/wallet/new-address'),
  addressActivity: route('/address/activity'),
  addressSettings: route((address: string) => `/address/${address}/settings`, `/address/:address/settings`),
  addressDeleteConfirm: route(
    (address: string) => `/address/${address}/delete-confirm`,
    `/address/:address/delete-confirm`
  ),
  // Believe it or not, there is no support for optional params in react-router-dom v6. That's why you'll see in some
  // places the string 'undefined'. See https://github.com/remix-run/react-router/issues/7285#issuecomment-620071853
  sendToken: route((address: string) => `/send-token/${address}`, `/send-token/:address`),
  exportPrivateKey: route('/export-private-key'),
  fundingQrCode: route((address: string) => `/funding/qr-code/${address}`, `/funding/qr-code/:address`),
  token: route((tokenAddress: string) => `/tokens/${tokenAddress}`, '/tokens/:tokenAddress'),
  reset: route('/reset'),
  settings: route('/settings'),
  settingsNetworks: route('/settings/networks'),
  settingsSeed: routeWithReturnTo('/settings/seed'),
  settingsAddCustomNetwork: route('/settings/networks/add'),
  settingsEditCustomNetwork: route('/settings/networks/edit'),
  settingsRemoveCustomNetwork: route('/settings/networks/remove'),
  settingsDappConnections: route('/settings/dapp-connections'),
  settingsPrivacy: route('/settings/privacy'),
  networkWarning: route('/network-warning'),
  error: route('/error')
}
