import { KeyType } from "@alephium/web3"
import { Flex } from "@chakra-ui/react"
import { L2 } from "@argent/ui"
import { FC, useCallback, useMemo, useState } from "react"
import styled from "styled-components"

import {
  equalPreAuthorization,
  useIsPreauthorized,
  usePreAuthorizations,
} from "../../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/wallet.service"
import { ColumnCenter } from "../../../components/Column"
import { LinkIcon } from "../../../components/Icons/MuiIcons"
import { Account } from "../../accounts/Account"
import { AccountListItemProps } from "../../accounts/AccountListItem"
import {
  getAccountName,
  getDefaultAccountNameByIndex,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { useAccountsOnNetwork, useSelectedAccount } from "../../accounts/accounts.state"
import { AccountSelect } from "../../accounts/AccountSelect"
import { useCurrentNetwork } from "../../networks/useNetworks"
import {
  ConfirmPageProps,
  DeprecatedConfirmScreen,
} from "../DeprecatedConfirmScreen"
import { DappIcon } from "./DappIcon"
import { useDappDisplayAttributes } from "./useDappDisplayAttributes"
import { Wallet } from "../../../../background/wallet"
import { Option } from "../../../components/Options"
import { AlephiumLogo } from "../../../components/Icons/ArgentXLogo"
import { createAccount } from "../../accounts/accounts.service"
import { useAppState } from "../../../app.state"
import { getAccounts, accountsOnNetwork } from "../../../services/backgroundAccounts"

interface ConnectDappProps extends Omit<ConfirmPageProps, "onSubmit"> {
  onConnect: (selectedAccount?: Account) => void
  onDisconnect: (selectedAccount?: Account) => void
  host: string
  networkId?: string,
  group?: number
  keyType?: KeyType
}

export interface IConnectDappAccountSelect {
  accounts: Account[]
  selectedAccount?: BaseWalletAccount
  onSelectedAccountChange?: (account: BaseWalletAccount) => void
  host: string
}

export const ConnectDappAccountSelect: FC<IConnectDappAccountSelect> = ({
  accounts = [],
  selectedAccount,
  onSelectedAccountChange,
  host,
}) => {
  const { accountNames } = useAccountMetadata()
  const preAuths = usePreAuthorizations()
  const makeAccountListItem = useCallback(
    (account: Account): AccountListItemProps => {
      const accountName = getAccountName(account, accountNames)
      const connected = Boolean(
        preAuths.some((preAuth) =>
          equalPreAuthorization(preAuth, {
            host,
            account,
          }),
        ),
      )
      return {
        accountName,
        accountAddress: account.address,
        networkId: account.networkId,
        keyType: account.signer.keyType,
        connectedHost: connected ? host : undefined,
        accountType: account.type,
      }
    },
    [accountNames, host, preAuths],
  )
  const accountItems = useMemo(
    () => accounts.map(makeAccountListItem),
    [accounts, makeAccountListItem],
  )
  const selectedAccountItem = useMemo(
    () =>
      accountItems.find(
        (accountItem) =>
          selectedAccount &&
          accountsEqual(
            {
              address: accountItem.accountAddress,
              networkId: accountItem.networkId,
            },
            selectedAccount,
          ),
      ),
    [accountItems, selectedAccount],
  )
  const onSelectedAccountItemChange = useCallback(
    (accountItem: AccountListItemProps) => {
      onSelectedAccountChange &&
        onSelectedAccountChange({
          address: accountItem.accountAddress,
          networkId: accountItem.networkId,
        })
    },
    [onSelectedAccountChange],
  )
  return (
    <AccountSelect
      accounts={accountItems}
      selectedAccount={selectedAccountItem}
      onSelectedAccountChange={onSelectedAccountItemChange}
      key={selectedAccountItem?.accountAddress}
    />
  )
}

const DappIconContainer = styled.div`
  width: 64px;
  height: 64px;
`

const Title = styled.div`
  font-weight: 600;
  font-size: 17px;
  margin-top: 16px;
  text-align: center;
`

const Host = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 8px;
  text-align: center;
`

const HR = styled.div`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.bg2};
  margin: 16px 0;
`

const SmallText = styled.div`
  font-size: 13px;
`

const WarningText = styled.div`
  font-size: 15px;
`

const SelectContainer = styled.div`
  padding-top: 16px;
`

const ConnectedStatusWrapper = styled.div`
  color: ${({ theme }) => theme.blue1};
  display: flex;
  align-items: center;
  font-size: 10px;
  padding-top: 8px;
`

const ConnectedIcon = styled(LinkIcon)`
  transform: rotate(-45deg);
  font-size: 16px;
`

const List = styled.ul`
  font-size: 15px;
  line-height: 20px;
  margin-top: 8px;
  list-style-position: inside;
`

const Bullet = styled.li``

const SmallGreyText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  margin-left: 20px;
`

const Label = ({text}: {text: string}) => {
  return <L2
    backgroundColor={"neutrals.700"}
    px={"6px"}
    py={"3px"}
    textTransform="capitalize"
    fontWeight={"bold"}
    color={"warn-high.300"}
    borderRadius={"none"}
    border={"1px solid"}
    borderColor={"neutrals.600"}
  >
    {text}
  </L2>
}

export const ConnectDappScreen: FC<ConnectDappProps> = ({
  onConnect: onConnectProp,
  onDisconnect: onDisconnectProp,
  onReject: onRejectProp,
  host,
  networkId,
  group,
  keyType,
  ...rest
}) => {
  const { switcherNetworkId } = useAppState()
  let initiallySelectedAccount = useSelectedAccount()
  if (initiallySelectedAccount && !Wallet.checkAccount(initiallySelectedAccount, networkId, keyType, group)) {
    initiallySelectedAccount = undefined
  }

  const currentNetwork = useCurrentNetwork()
  const initialVisibleAccounts = useAccountsOnNetwork({
    networkId: networkId || currentNetwork.id,
    showHidden: false
  })

  const [visibleAccounts, setVisibleAccounts] = useState<Account[]>(initialVisibleAccounts)

  const visibleAccountsForGroup = (group === undefined && keyType === undefined) ? visibleAccounts : visibleAccounts.filter((account) => {
    return Wallet.checkAccount(account, networkId, keyType, group)
  })
  const foundAccount = visibleAccountsForGroup.length > 0

  if (foundAccount && !initiallySelectedAccount) {
    initiallySelectedAccount = visibleAccountsForGroup[0]
  }

  const [connectedAccount, setConnectedAccount] = useState<
    BaseWalletAccount | undefined
  >(initiallySelectedAccount)

  const isConnected = useIsPreauthorized(host, initiallySelectedAccount)

  const selectedAccount = useMemo(() => {
    if (connectedAccount) {
      const account = visibleAccountsForGroup.find((account) =>
        accountsEqual(account, connectedAccount),
      )
      return account
    }
  }, [visibleAccountsForGroup, connectedAccount])

  const { setAccountName } = useAccountMetadata()

  const generateAccount = useCallback(async () => {
    const allAccounts = await getAccounts(true)
    const selectedNetworkId = networkId ?? switcherNetworkId
    const walletAccounts = accountsOnNetwork(allAccounts, selectedNetworkId)
    const accountIndex = walletAccounts.length
    const account = await createAccount(selectedNetworkId, keyType ?? 'default', undefined, group)
    setVisibleAccounts([account])
    setAccountName(account.networkId, account.address, getDefaultAccountNameByIndex(account, accountIndex))
    setConnectedAccount(account)
  }, [keyType, networkId, group, switcherNetworkId, setAccountName])

  const onSelectedAccountChange = useCallback((account: BaseWalletAccount) => {
    setConnectedAccount(account)
  }, [])

  const onConnect = useCallback(() => {
    onConnectProp(selectedAccount)
  }, [onConnectProp, selectedAccount])

  const onDisconnect = useCallback(() => {
    onDisconnectProp(selectedAccount)
  }, [onDisconnectProp, selectedAccount])

  const dappDisplayAttributes = useDappDisplayAttributes(host)

  return (
    <DeprecatedConfirmScreen
      confirmButtonText={isConnected ? "Continue" : "Connect"}
      confirmButtonDisabled={!foundAccount ? true : false}
      rejectButtonText={isConnected ? "Disconnect" : "Reject"}
      onSubmit={onConnect}
      onReject={isConnected ? onDisconnect : onRejectProp}
      {...rest}
    >
      <ColumnCenter gap={"4px"}>
        <DappIconContainer>
          <DappIcon host={host} />
        </DappIconContainer>
        <Title>Connect to {`${dappDisplayAttributes?.title ?? 'Unknown'}`}</Title>
        <Host>{host}</Host>
        <Flex gap={2} alignItems={"center"}>
          <Label text={group !== undefined ? `Group: ${group}` : `Any group`}/>
          <Label text={networkId !== undefined ? `${networkId}` : `Current net`}/>
          { keyType === 'bip340-schnorr' && <Label text="Schnorr"/>}
        </Flex>
      </ColumnCenter>
      <HR />
      {
        foundAccount ? (
          <>
            <SmallText>Select the account to connect:</SmallText>
            <SelectContainer>
              <ConnectDappAccountSelect
                accounts={visibleAccountsForGroup}
                selectedAccount={connectedAccount}
                onSelectedAccountChange={onSelectedAccountChange}
                host={host}
              />
              {isConnected && (
                <ConnectedStatusWrapper>
                  <ConnectedIcon />
                  <span> This account is already connected</span>
                </ConnectedStatusWrapper>
              )}
            </SelectContainer>
            <HR />
            <SmallText>This app will be able to:</SmallText>
            <List>
              <Bullet>Read your wallet address</Bullet>
              <Bullet>Request transactions</Bullet>{" "}
              <SmallGreyText>
                You will still need to sign any new transaction
              </SmallGreyText>
            </List>
          </>
        ) : (
          <>
            <WarningText>
              There are no accounts on {networkId !== undefined && <Label text={`${networkId}`}/>} for
              group {group !== undefined && <Label text={`${group}`}/>}. Please generate a new account first.
            </WarningText>
            <HR />
            <Option
              title="Create new Alephium account"
              icon={<StyledAlephiumLogo />}
              description="Generate a new wallet address"
              hideArrow
              onClick={() => generateAccount()}
            />
          </>
        )
      }
    </DeprecatedConfirmScreen>
  )
}

const StyledAlephiumLogo = styled(AlephiumLogo)`
  font-size: 20px;
  color: ${({ theme }) => theme.primary};
  width: 1.5em;
  height: 1.5em;
`
