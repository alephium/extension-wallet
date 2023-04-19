import { Route, Routes, RoutesConfig } from "@argent/stack-router"
import { chakra } from "@chakra-ui/react"
import { FC, ReactNode, isValidElement, useMemo } from "react"
// import { Outlet, Route, Routes } from "react-router-dom" // reinstate in case of issues with @argent/stack-router
import { Outlet, useLocation } from "react-router-dom"

import { useAppState } from "./app.state"
import { ResponsiveBox } from "./components/Responsive"
import { TransactionDetailScreen } from "./features/accountActivity/TransactionDetailScreen"
import { AccountEditScreen } from "./features/accountEdit/AccountEditScreen"
import { AccountListHiddenScreen } from "./features/accounts/AccountListHiddenScreen"
import { AccountListScreen } from "./features/accounts/AccountListScreen"
import { AccountScreen } from "./features/accounts/AccountScreen"
import { AddAlephiumAccountScreen } from "./features/accounts/AddAlephiumAccountScreen"
import { AddAccount } from "./features/accounts/AddAccount"
import { HideOrDeleteAccountConfirmScreen } from "./features/accounts/HideOrDeleteAccountConfirmScreen"
import { UpgradeScreen } from "./features/accounts/UpgradeScreen"
import { ExportPrivateKeyScreen } from "./features/accountTokens/ExportPrivateKeyScreen"
import { HideTokenScreen } from "./features/accountTokens/HideTokenScreen"
import { SendTokenScreen } from "./features/accountTokens/SendTokenScreen"
import { TokenScreen } from "./features/accountTokens/TokenScreen"
import { useActions } from "./features/actions/actions.state"
import { ActionScreen } from "./features/actions/ActionScreen"
import { ErrorScreen } from "./features/actions/ErrorScreen"
import { LoadingScreen } from "./features/actions/LoadingScreen"
import { FundingProviderScreen } from "./features/funding/FundingProviderScreen"
import { FundingQrCodeScreen } from "./features/funding/FundingQrCodeScreen"
import { FundingScreen } from "./features/funding/FundingScreen"
import { LockScreen } from "./features/lock/LockScreen"
import { ResetScreen } from "./features/lock/ResetScreen"
import { NetworkWarningScreen } from "./features/networks/NetworkWarningScreen"
import { MigrationDisclaimerScreen } from "./features/onboarding/MigrationDisclaimerScreen"
import { OnboardingDisclaimerScreen } from "./features/onboarding/OnboardingDisclaimerScreen"
import { OnboardingFinishScreen } from "./features/onboarding/OnboardingFinishScreen"
import { OnboardingPasswordScreen } from "./features/onboarding/OnboardingPasswordScreen"
import { OnboardingPrivacyStatementScreen } from "./features/onboarding/OnboardingPrivacyStatementScreen"
import { OnboardingRestoreBackup } from "./features/onboarding/OnboardingRestoreBackup"
import { OnboardingRestorePassword } from "./features/onboarding/OnboardingRestorePassword"
import { OnboardingRestoreSeed } from "./features/onboarding/OnboardingRestoreSeed"
import { OnboardingStartScreen } from "./features/onboarding/OnboardingStartScreen"
import { BackupDownloadScreen } from "./features/recovery/BackupDownloadScreen"
import { RecoverySetupScreen } from "./features/recovery/RecoverySetupScreen"
import { SeedRecoveryConfirmScreen } from "./features/recovery/SeedRecoveryConfirmScreen"
import { SeedRecoverySetupScreen } from "./features/recovery/SeedRecoverySetupScreen"
import { SendScreen } from "./features/send/SendScreen"
import { AddressbookAddOrEditScreen } from "./features/settings/AddressbookAddOrEditScreen"
import { AddressbookSettingsScreen } from "./features/settings/AddressbookSettingsScreen"
import { BlockExplorerSettingsScreen } from "./features/settings/BlockExplorerSettingsScreen"
import { DappConnectionsSettingsScreen } from "./features/settings/DappConnectionsSettingsScreen"
import { DeveloperSettings } from "./features/settings/DeveloperSettings"
import { PrivacyExperimentalSettings } from "./features/settings/ExperimentalSettings"
import { NetworkSettingsEditScreen } from "./features/settings/NetworkSettingsEditScreen"
import { NetworkSettingsFormScreen } from "./features/settings/NetworkSettingsFormScreen"
import { NetworkSettingsScreen } from "./features/settings/NetworkSettingsScreen"
import { PrivacySettingsScreen } from "./features/settings/PrivacySettingsScreen"
import { SeedSettingsScreen } from "./features/settings/SeedSettingsScreen"
import { SettingsPrivacyStatementScreen } from "./features/settings/SettingsPrivacyStatementScreen"
import { SettingsScreen } from "./features/settings/SettingsScreen"
import { ReviewFeedbackScreen } from "./features/userReview/ReviewFeedbackScreen"
import { ReviewRatingScreen } from "./features/userReview/ReviewRatingScreen"
import { routes } from "./routes"
import { useEntryRoute } from "./useEntryRoute"
import { AddTokenScreen } from "./features/actions/AddTokenScreen"
import { LedgerStartScreen } from "./features/ledger/start"
import { LedgerDoneScreen } from "./features/ledger/done"

const ResponsiveContainer = chakra(ResponsiveBox, {
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100vh",
    overflowY: "hidden",
    overscrollBehavior: "none",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
})

const ResponsiveRoutes: FC = () => (
  <ResponsiveContainer>
    <Outlet />
  </ResponsiveContainer>
)

// Routes which don't need an unlocked wallet

const nonWalletRoutes = (
  <>
    <Route path={routes.error.path} element={<ErrorScreen />} />
    <Route path={routes.lockScreen.path} element={<LockScreen />} />
    <Route path={routes.reset.path} element={<ResetScreen />} />
    <Route
      path={routes.migrationDisclaimer.path}
      element={<MigrationDisclaimerScreen />}
    />
  </>
)

// Routes which need an unlocked wallet and therefore can also sign actions

const walletRoutes = (
  <>
    <Route
      presentation="modal"
      path={routes.networkWarning.path}
      element={<NetworkWarningScreen />}
    />
    <Route
      presentation="push"
      path={routes.accountTokens.path}
      element={<AccountScreen tab="tokens" />}
    />
    <Route
      presentation="push"
      path={routes.accountCollections.path}
      element={<AccountScreen tab="collections" />}
    />
    <Route
      presentation="push"
      path={routes.accountActivity.path}
      element={<AccountScreen tab="activity" />}
    />
    <Route
      presentation="modal"
      path={routes.accounts.path}
      element={<AccountListScreen />}
    />
    <Route
      presentation="push"
      path={routes.editAccount.path}
      element={<AccountEditScreen />}
    />
    <Route
      presentation="modal"
      path={routes.settings.path}
      element={<SettingsScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsPrivacy.path}
      element={<PrivacySettingsScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsAddCustomNetwork.path}
      element={<NetworkSettingsFormScreen mode="add" />}
    />
    <Route
      presentation="push"
      path={routes.settingsEditCustomNetwork.path}
      element={<NetworkSettingsEditScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsBlockExplorer.path}
      element={<BlockExplorerSettingsScreen />}
    />
    <Route path={routes.settingsSeed.path} element={<SeedSettingsScreen />} />
    <Route
      presentation="push"
      path={routes.settingsDappConnections.path}
      element={<DappConnectionsSettingsScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsAddressbook.path}
      element={<AddressbookSettingsScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsAddressbookAdd.path}
      element={<AddressbookAddOrEditScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsAddressbookEdit.path}
      element={<AddressbookAddOrEditScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsDeveloper.path}
      element={<DeveloperSettings />}
    />
    <Route
      presentation="push"
      path={routes.settingsExperimental.path}
      element={<PrivacyExperimentalSettings />}
    />
    <Route
      presentation="push"
      path={routes.settingsNetworks.path}
      element={<NetworkSettingsScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsPrivacyStatement.path}
      element={<SettingsPrivacyStatementScreen />}
    />
    <Route
      presentation="modal"
      path={routes.transactionDetail.path}
      element={<TransactionDetailScreen />}
    />
    <Route
      presentation="push"
      path={routes.accountHideConfirm.path}
      element={<HideOrDeleteAccountConfirmScreen mode="hide" />}
    />
    <Route
      presentation="push"
      path={routes.accountDeleteConfirm.path}
      element={<HideOrDeleteAccountConfirmScreen mode="delete" />}
    />
    <Route path={routes.upgrade.path} element={<UpgradeScreen />} />
    <Route
      presentation="push"
      path={routes.hideToken.path}
      element={<HideTokenScreen />}
    />
    <Route path={routes.sendScreen.path} element={<SendScreen />} />
    <Route path={routes.sendToken.path} element={<SendTokenScreen />} />
    <Route
      presentation="push"
      path={routes.accountsHidden.path}
      element={<AccountListHiddenScreen />}
    />
    <Route
      presentation={"modal"}
      path={routes.funding.path}
      element={<FundingScreen />}
    />
    <Route
      presentation="push"
      path={routes.fundingQrCode.path}
      element={<FundingQrCodeScreen />}
    />
    <Route
      presentation="push"
      path={routes.fundingProvider.path}
      element={<FundingProviderScreen />}
    />
    <Route
      path={routes.confirmSeedRecovery.path}
      element={<SeedRecoveryConfirmScreen />}
    />
    <Route
      path={routes.setupSeedRecovery.path}
      element={<SeedRecoverySetupScreen />}
    />
    <Route path={routes.setupRecovery.path} element={<RecoverySetupScreen />} />
    <Route path={routes.newToken.path} element={<AddTokenScreen />} />
    <Route path={routes.token.path} element={<TokenScreen />} />
    <Route
      path={routes.backupDownload.path}
      element={<BackupDownloadScreen />}
    />
    <Route
      path={routes.exportPrivateKey.path}
      element={<ExportPrivateKeyScreen />}
    />
    <Route
      path={routes.addAlephiumAccount.path}
      element={<AddAlephiumAccountScreen />}
    />
  </>
)

const fullscreenRoutes = (
  <>
    <Route
      path={routes.onboardingStart.path}
      element={<OnboardingStartScreen />}
    />
    <Route
      path={routes.onboardingDisclaimer.path}
      element={<OnboardingDisclaimerScreen />}
    />
    <Route
      path={routes.onboardingPrivacyStatement.path}
      element={<OnboardingPrivacyStatementScreen />}
    />
    <Route
      path={routes.onboardingPassword.path}
      element={<OnboardingPasswordScreen />}
    />
    <Route
      path={routes.onboardingRestoreBackup.path}
      element={<OnboardingRestoreBackup />}
    />
    <Route
      path={routes.onboardingRestoreSeed.path}
      element={<OnboardingRestoreSeed />}
    />
    <Route
      path={routes.onboardingRestorePassword.path}
      element={<OnboardingRestorePassword />}
    />
    <Route
      path={routes.onboardingFinish.path}
      element={<OnboardingFinishScreen />}
    />
    <Route path={routes.userReview.path} element={<ReviewRatingScreen />} />
    <Route
      path={routes.userReviewFeedback.path}
      element={<ReviewFeedbackScreen />}
    />
    <Route path={routes.addAccount.path} element={<AddAccount />} />
    <Route
      path={routes.ledgerEntry.path}
      element={<LedgerStartScreen />}
    />
    <Route
      path={routes.ledgerDone.path}
      element={<LedgerDoneScreen />}
    />
  </>
)

/** Make a list of non-wallet routes which will show in place of actions */
const nonWalletPaths = nonWalletRoutes.props.children.flatMap(
  (child: ReactNode) => {
    return isValidElement(child) ? child.props.path : []
  },
)

export const AppRoutes: FC = () => {
  useEntryRoute()
  const location = useLocation()

  const { isLoading } = useAppState()
  const actions = useActions()

  const showActions = useMemo(() => {
    const hasActions = !!actions[0]
    const isNonWalletRoute = nonWalletPaths.includes(location.pathname)
    return hasActions && !isNonWalletRoute
  }, [actions, location.pathname])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (showActions) {
    return (
      <ResponsiveContainer>
        <ActionScreen />
      </ResponsiveContainer>
    )
  }

  return (
    <RoutesConfig defaultPresentation="replace">
      <Routes>
        <Route element={<ResponsiveRoutes />}>
          {nonWalletRoutes}
          {walletRoutes}
        </Route>
        {fullscreenRoutes}
      </Routes>
    </RoutesConfig>
  )
}
