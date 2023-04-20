import LedgerApp from "@alephium/ledger-app"
import { TransactionBuilder, utils } from "@alephium/web3"
import { getHDWalletPath } from '@alephium/web3-wallet';
import { L1, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"

import {
  ReviewTransactionResult,
  TransactionParams,
} from "../../../shared/actionQueue/types"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { rejectAction } from "../../services/backgroundActions"
import { Account } from "../accounts/Account"
import { getLedgerApp } from "../ledger/utils"
import { useNetwork } from "../networks/useNetworks"
import { ConfirmScreen } from "./ConfirmScreen"
import { ConfirmPageProps } from "./DeprecatedConfirmScreen"
import { FeeEstimation } from "./feeEstimation/FeeEstimation"
import { LoadingScreen } from "./LoadingScreen"
import { AccountNetworkInfo } from "./transaction/AccountNetworkInfo"
import { DappHeader } from "./transaction/DappHeader"
import { TransactionsList } from "./transaction/TransactionsList"

const { AlertIcon } = icons

export interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transaction: TransactionParams
  onSubmit: (
    result: ReviewTransactionResult & { signature?: string } | { error: string } | undefined,
  ) => void
}

async function buildTransaction(
  nodeUrl: string,
  account: Account,
  transaction: TransactionParams,
): Promise<ReviewTransactionResult> {
  const builder = TransactionBuilder.from(nodeUrl)
  switch (transaction.type) {
    case "TRANSFER":
      return {
        type: transaction.type,
        params: transaction.params,
        result: await builder.buildTransferTx(
          transaction.params,
          account.publicKey,
        ),
      }
    case "DEPLOY_CONTRACT":
      return {
        type: transaction.type,
        params: transaction.params,
        result: await builder.buildDeployContractTx(
          transaction.params,
          account.publicKey,
        ),
      }
    case "EXECUTE_SCRIPT":
      return {
        type: transaction.type,
        params: transaction.params,
        result: await builder.buildExecuteScriptTx(
          transaction.params,
          account.publicKey,
        ),
      }
    case "UNSIGNED_TX":
      return {
        type: transaction.type,
        params: transaction.params,
        result: await builder.buildUnsignedTx(transaction.params),
      }
  }
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transaction,
  selectedAccount,
  actionHash,
  onSubmit,
  ...props
}) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [buildResult, setBuildResult] = useState<
    ReviewTransactionResult | { error: string } | undefined
  >()
  const { id: networkId, nodeUrl } = useNetwork(
    selectedAccount?.networkId ?? "unknown",
  )

  const useLedger =
    selectedAccount !== undefined && selectedAccount.signer.type === "ledger"
  const [ledgerApp, setLedgerApp] = useState<LedgerApp>()
  const [signingWithLedger, setSigningWithLedger] = useState<boolean>(false)

  // TODO: handle error
  useEffect(() => {
    const build = async () => {
      if (selectedAccount === undefined) {
        return
      }

      try {
        const buildResult = await buildTransaction(
          nodeUrl,
          selectedAccount,
          transaction,
        )
        setBuildResult(buildResult)
      } catch (e: any) {
        console.error("Error building transaction", e)
        setBuildResult({ error: e.toString() })
      }
    }

    build()
  }, [nodeUrl, selectedAccount, transaction])

  const ledgerSign = useCallback(async () => {
    console.log(`====== connectLedger`, buildResult, useLedger, ledgerApp)
    if (useLedger && !signingWithLedger) {
      setSigningWithLedger(true)
    }
    {if (buildResult && !("error" in buildResult) && useLedger && ledgerApp === undefined) {
      try {
        const app = await getLedgerApp()
        setLedgerApp(app)
        const path = getHDWalletPath(selectedAccount.signer.keyType, selectedAccount.signer.derivationIndex)
        const signature = await app.signHash(path, Buffer.from(buildResult.result.txId, 'hex'))
        onSubmit({...buildResult, signature})
        console.log(`========== connected`, app, signature)
      } catch (e) {
        console.log(`==== try again`, e)
        setTimeout(ledgerSign, 1000)
      }
    }}
  }, [signingWithLedger, buildResult, ledgerApp, useLedger, onSubmit])

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (!buildResult) {
    return <LoadingScreen />
  }

  if ("error" in buildResult) {
    useAppState.setState({
      error: `Failed in building transaction: ${buildResult.error}`,
      isLoading: false,
    })
    rejectAction(actionHash)
    return <Navigate to={routes.error()} />
  }

  return (
    <ConfirmScreen
      confirmButtonText={signingWithLedger ? "Ledger..." : useLedger ? "Sign with Ledger" : "Sign"}
      confirmButtonDisabled={signingWithLedger}
      rejectButtonText="Cancel"
      selectedAccount={selectedAccount}
      onSubmit={() => {
        if (useLedger) {
          ledgerSign()
        } else {
          onSubmit(buildResult)
        }
      }}
      showHeader={false}
      footer={
        buildResult &&
        !("error" in buildResult) && (
          <Flex direction="column" gap="1">
            {signingWithLedger && !ledgerApp && (
              <Flex
                direction="column"
                backgroundColor="#330105"
                boxShadow="menu"
                py="3.5"
                px="3.5"
                borderRadius="xl"
              >
                <Flex gap="1" align="center">
                  <Text color="errorText">
                    <AlertIcon />
                  </Text>
                  <L1 color="errorText">The ledger app is not connected</L1>
                </Flex>
              </Flex>
            )}
            <FeeEstimation
              onErrorChange={() => { return }}
              accountAddress={selectedAccount.address}
              networkId={selectedAccount.networkId}
              transaction={buildResult}
              actionHash={actionHash}
            />
          </Flex>
        )
      }
      {...props}
    >
      <DappHeader transaction={transaction} />

      <TransactionsList networkId={networkId} transactionReview={buildResult} />
      <AccountNetworkInfo account={selectedAccount} />
    </ConfirmScreen>
  )
}
