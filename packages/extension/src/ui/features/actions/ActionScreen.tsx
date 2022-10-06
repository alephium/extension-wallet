import { FC, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { waitForMessage } from '../../../shared/messages'
import { useAppState } from '../../app.state'
import { routes } from '../../routes'
import { assertNever } from '../../services/assertNever'
import { approveAction, rejectAction } from '../../services/backgroundActions'
import { useDefaultAddress } from '../addresses/addresses.state'
import { focusExtensionTab, useExtensionIsInTab } from '../browser/tabs'
import { useActions } from './actions.state'
import { AddNetworkScreen } from './AddNetworkScreen'
import { ApproveTransactionScreen } from './ApproveTransactionScreen'
import { ConnectDappScreen } from './ConnectDappScreen'

const isPopup = new URLSearchParams(window.location.search).has('popup')

export const ActionScreen: FC = () => {
  const navigate = useNavigate()
  const address = useDefaultAddress()
  const extensionIsInTab = useExtensionIsInTab()
  const { actions } = useActions()

  const [action] = actions
  const isLastAction = actions.length === 1

  const onSubmit = useCallback(async () => {
    approveAction(action)
    if (isPopup && isLastAction) {
      window.close()
    }
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onReject = useCallback(async () => {
    rejectAction(action)
    if (isPopup && isLastAction) {
      window.close()
    }
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /** Focus the extension if it is running in a tab  */
  useEffect(() => {
    const init = async () => {
      if (extensionIsInTab) {
        await focusExtensionTab()
      }
    }
    init()
  }, [extensionIsInTab, action.type])

  switch (action.type) {
    case 'CONNECT_DAPP': {
      return <ConnectDappScreen host={action.payload.host} onReject={onReject} onSubmit={onSubmit} />
    }

    case 'REQUEST_ADD_CUSTOM_NETWORK':
      return (
        <AddNetworkScreen requestedNetwork={action.payload} hideBackButton onSubmit={onSubmit} onReject={onReject} />
      )

    case 'REQUEST_SWITCH_CUSTOM_NETWORK':
      return (
        <AddNetworkScreen
          requestedNetwork={action.payload}
          mode="switch"
          hideBackButton
          onSubmit={onSubmit}
          onReject={onReject}
        />
      )

    case 'TRANSACTION': {
      return (
        <ApproveTransactionScreen
          payload={action.payload}
          actionHash={action.meta.hash}
          onSubmit={async () => {
            approveAction(action)
            useAppState.setState({ isLoading: true })
            const result = await Promise.race([
              waitForMessage('TRANSACTION_SUBMITTED', ({ data }) => data.actionHash === action.meta.hash),
              waitForMessage('TRANSACTION_FAILED', ({ data }) => data.actionHash === action.meta.hash)
            ])
            if ('error' in result) {
              useAppState.setState({
                error: `Sending transaction failed: ${result.error}`,
                isLoading: false
              })
              navigate(routes.error())
            } else {
              if (isPopup && isLastAction) {
                window.close()
              }
              useAppState.setState({ isLoading: false })
            }
          }}
          onReject={onReject}
          defaultAddress={address}
        />
      )
    }

    default:
      assertNever(action)
      return <></>
  }
}
