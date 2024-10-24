import { FC, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { waitForMessage } from "../../../shared/messages"
import { removePreAuthorization } from "../../../shared/preAuthorizations"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { analytics } from "../../services/analytics"
import { assertNever } from "../../services/assertNever"
import { selectAccount } from "../../services/backgroundAccounts"
import { approveAction, rejectAction } from "../../services/backgroundActions"
import { Account } from "../accounts/Account"
import { useAccount, useSelectedAccount } from "../accounts/accounts.state"
import { EXTENSION_IS_POPUP } from "../browser/constants"
import { focusExtensionTab, useExtensionIsInTab } from "../browser/tabs"
import { useActions } from "./actions.state"
import { AddNetworkScreen } from "./AddNetworkScreen"
import { AddTokenScreen } from "./AddTokenScreen"
import { ApproveSignatureScreen } from "./ApproveSignatureScreen"
import { ApproveSignUnsignedTxScreen } from "./ApproveSignUnsignedTxScreen"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { ConnectDappScreen } from "./connectDapp/ConnectDappScreen"
import { useTranslation } from "react-i18next"

export const ActionScreen: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const selectedAccount = useSelectedAccount()
  const extensionIsInTab = useExtensionIsInTab()
  const actions = useActions()

  const [action] = actions
  const isLastAction = actions.length === 1
  const signerAccount = useAccount(action.type === 'ALPH_TRANSACTION' && selectedAccount
    ? { address: action.payload.params.signerAddress, networkId: action.payload.params.networkId ?? selectedAccount.networkId }
    : (action.type === 'ALPH_SIGN_MESSAGE' || action.type === 'ALPH_SIGN_UNSIGNED_TX') && selectedAccount
      ? { address: action.payload.signerAddress, networkId: action.payload.networkId ?? selectedAccount.networkId }
      : undefined
  )

  const closePopup = useCallback(() => {
    if (EXTENSION_IS_POPUP) {
      window.close()
    }
  }, [])
  const closePopupIfLastAction = useCallback(() => {
    if (isLastAction) {
      closePopup()
    }
  }, [closePopup, isLastAction])

  const onSubmit = useCallback(async () => {
    await approveAction(action)
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction])

  const onReject = useCallback(async () => {
    await rejectAction(action.meta.hash, t('User rejected'))
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction, t])

  /** Focus the extension if it is running in a tab  */
  useEffect(() => {
    const init = async () => {
      if (extensionIsInTab) {
        await focusExtensionTab()
      }
    }
    init()
  }, [extensionIsInTab, action?.type])

  switch (action?.type) {
    case "ALPH_CONNECT_DAPP":
      return (
        <ConnectDappScreen
          host={action.payload.host}
          networkId={action.payload.networkId}
          group={action.payload.group}
          keyType={action.payload.keyType}
          onConnect={async (selectedAccount?: Account) => {
            if (selectedAccount) {
              useAppState.setState({ isLoading: true })
              selectAccount(selectedAccount)
              // continue with approval with selected account
              await approveAction(action)
              await waitForMessage("ALPH_CONNECT_DAPP_RES")
              useAppState.setState({ isLoading: false })
            }
            closePopupIfLastAction()
          }}
          onDisconnect={async (selectedAccount?: Account) => {
            if (selectedAccount) {
              await removePreAuthorization(action.payload.host, selectedAccount)
              await rejectAction(action.meta.hash, t('User disconnected'))
            }
            closePopupIfLastAction()
          }}
          onReject={onReject}
        />
      )

    case "ALPH_REQUEST_ADD_TOKEN":
      return (
        <AddTokenScreen
          defaultToken={action.payload}
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
        />
      )

    case "ALPH_REQUEST_ADD_CUSTOM_NETWORK":
      return (
        <AddNetworkScreen
          requestedNetwork={action.payload}
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
          mode="add"
        />
      )

    case "ALPH_REQUEST_SWITCH_CUSTOM_NETWORK":
      return (
        <AddNetworkScreen
          requestedNetwork={action.payload}
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
          mode="switch"
        />
      )

    case "ALPH_TRANSACTION":
      return (
        <ApproveTransactionScreen
          transaction={action.payload}
          actionHash={action.meta.hash}
          onSubmit={async (builtTransaction) => {
            analytics.track("signedTransaction", {
              networkId: selectedAccount?.networkId || "unknown",
            })
            if (!builtTransaction || "error" in builtTransaction) {
              useAppState.setState({
                error: `${t('Transaction building failed')}: ${builtTransaction?.error || t("unknown")}`,
                isLoading: false,
              })
              navigate(routes.error())
            } else {
              await approveAction(action, builtTransaction)
              useAppState.setState({ isLoading: true })
              const result = await Promise.race([
                waitForMessage(
                  "ALPH_TRANSACTION_SUBMITTED",
                  ({ data }) => data.actionHash === action.meta.hash,
                ),
                waitForMessage(
                  "ALPH_TRANSACTION_FAILED",
                  ({ data }) => data.actionHash === action.meta.hash,
                ),
              ])
              // (await) blocking as the window may closes afterwards
              await analytics.track("sentTransaction", {
                success: !("error" in result),
                networkId: selectedAccount?.networkId || t("unknown"),
              })
              if ("error" in result) {
                useAppState.setState({
                  error: `${t('Sending transaction failed')}: ${result.error}`,
                  isLoading: false,
                })
                navigate(routes.error())
              } else {
                closePopupIfLastAction()
                useAppState.setState({ isLoading: false })
              }
            }
          }}
          onReject={onReject}
          selectedAccount={signerAccount}
        />
      )

    case "ALPH_SIGN_MESSAGE":
      return (
        <ApproveSignatureScreen
          dataToSign={action.payload}
          onSubmit={async () => {
            await approveAction(action)
            useAppState.setState({ isLoading: true })
            const result = await Promise.race([
              waitForMessage(
                'ALPH_SIGN_MESSAGE_SUCCESS',
                ({ data }) => data.actionHash === action.meta.hash,
              ),
              waitForMessage(
                'ALPH_SIGN_MESSAGE_FAILURE',
                ({ data }) => data.actionHash === action.meta.hash,
              ),
            ])
            if ("error" in result) {
              useAppState.setState({
                error: `${t('Sign message failed')}: ${result.error}`,
                isLoading: false,
              })
              navigate(routes.error())
            } else {
              closePopupIfLastAction()
              useAppState.setState({ isLoading: false })
            }
          }}
          onReject={onReject}
          selectedAccount={signerAccount}
        />
      )

    case 'ALPH_SIGN_UNSIGNED_TX':
      return (
        <ApproveSignUnsignedTxScreen
          params={action.payload}
          onSubmit={async (signatureOpt) => {
            await approveAction(action, signatureOpt)
            useAppState.setState({ isLoading: true })
            const result = await Promise.race([
              waitForMessage(
                'ALPH_SIGN_UNSIGNED_TX_SUCCESS',
                ({ data }) => data.actionHash === action.meta.hash,
              ),
              waitForMessage(
                'ALPH_SIGN_UNSIGNED_TX_FAILURE',
                ({ data }) => data.actionHash === action.meta.hash,
              ),
            ])
            if ("error" in result) {
              useAppState.setState({
                error: `${t('Sign raw tx failed')}: ${result.error}`,
                isLoading: false,
              })
              navigate(routes.error())
            } else {
              closePopupIfLastAction()
              useAppState.setState({ isLoading: false })
            }
          }}
          onReject={onReject}
          selectedAccount={signerAccount}
        />
      )

    default:
      assertNever(action)
      return <></>
  }
}
