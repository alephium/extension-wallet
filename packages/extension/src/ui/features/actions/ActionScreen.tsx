import { FC, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { TransactionResult } from "../../../shared/actionQueue/types"

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
import { ApproveDeclareContractScreen } from "./ApproveDeclareContractScreen"
import { ApproveDeployAccountScreen } from "./ApproveDeployAccount"
import { ApproveDeployContractScreen } from "./ApproveDeployContractScreen"
import { ApproveSignatureScreen } from "./ApproveSignatureScreen"
import { ApproveTransactionScreen } from "./ApproveTransactionScreen"
import { ConnectDappScreen } from "./connectDapp/ConnectDappScreen"

export const ActionScreen: FC = () => {
  const navigate = useNavigate()
  const selectedAccount = useSelectedAccount()
  const extensionIsInTab = useExtensionIsInTab()
  const actions = useActions()

  const [action] = actions
  const isLastAction = actions.length === 1
  const signerAccount = useAccount(action.type === 'TRANSACTION' && selectedAccount
    ? { address: action.payload.params.signerAddress, networkId: selectedAccount?.networkId }
    : action.type === 'SIGN' && selectedAccount
    ? { address: action.payload.signerAddress, networkId: selectedAccount?.networkId }
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
    await rejectAction(action.meta.hash)
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction])

  const rejectAllActions = useCallback(async () => {
    await rejectAction(actions.map((act) => act.meta.hash))
    closePopup()
  }, [actions, closePopup])

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
    case "CONNECT_DAPP":
      return (
        <ConnectDappScreen
          host={action.payload.host}
          networkId={action.payload.networkId}
          group={action.payload.group}
          onConnect={async (selectedAccount?: Account) => {
            if (selectedAccount) {
              useAppState.setState({ isLoading: true })
              selectAccount(selectedAccount)
              // continue with approval with selected account
              await approveAction(action)
              await waitForMessage("CONNECT_DAPP_RES")
              useAppState.setState({ isLoading: false })
            }
            closePopupIfLastAction()
          }}
          onDisconnect={async (selectedAccount?: Account) => {
            if (selectedAccount) {
              await removePreAuthorization(action.payload.host, selectedAccount)
              await rejectAction(action.meta.hash)
            }
            closePopupIfLastAction()
          }}
          onReject={onReject}
        />
      )

    case "REQUEST_ADD_CUSTOM_NETWORK":
      return (
        <AddNetworkScreen
          requestedNetwork={action.payload}
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
          mode="add"
        />
      )

    case "REQUEST_SWITCH_CUSTOM_NETWORK":
      return (
        <AddNetworkScreen
          requestedNetwork={action.payload}
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
          mode="switch"
        />
      )

    case "TRANSACTION":
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
                error: `Build transaction failed: ${builtTransaction?.error || "unknown"}`,
                isLoading: false,
              })
              navigate(routes.error())
            } else {
              await approveAction(action, builtTransaction)
              useAppState.setState({ isLoading: true })
              const result = await Promise.race([
                waitForMessage(
                  "TRANSACTION_SUBMITTED",
                  ({ data }) => data.actionHash === action.meta.hash,
                ),
                waitForMessage(
                  "TRANSACTION_FAILED",
                  ({ data }) => data.actionHash === action.meta.hash,
                ),
              ])
              // (await) blocking as the window may closes afterwards
              await analytics.track("sentTransaction", {
                success: !("error" in result),
                networkId: selectedAccount?.networkId || "unknown",
              })
              if ("error" in result) {
                useAppState.setState({
                  error: `Sending transaction failed: ${result.error}`,
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

    case "SIGN":
      return (
        <ApproveSignatureScreen
          dataToSign={action.payload}
          onSubmit={async () => {
            await approveAction(action)
            useAppState.setState({ isLoading: true })
            await waitForMessage(
              "SIGNATURE_SUCCESS",
              ({ data }) => data.actionHash === action.meta.hash,
            )
            await analytics.track("signedMessage", {
              networkId: selectedAccount?.networkId || "unknown",
            })
            closePopupIfLastAction()
            useAppState.setState({ isLoading: false })
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
