import { AlephiumApp as LedgerApp } from "@alephium/ledger-app"
import { getHDWalletPath } from "@alephium/web3-wallet"
import { L1, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import {
  ReviewTransactionResult,
  TransactionParams,
} from "../../../shared/actionQueue/types"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { rejectAction } from "../../services/backgroundActions"
import { useAllTokensWithBalance } from "../accountTokens/tokens.state"
import { getLedgerApp } from "../ledger/utils"
import { useNetwork } from "../networks/useNetworks"
import { ConfirmScreen } from "./ConfirmScreen"
import { ConfirmPageProps } from "./DeprecatedConfirmScreen"
import { FeeEstimation } from "./feeEstimation/FeeEstimation"
import { LoadingScreen } from "./LoadingScreen"
import { AccountNetworkInfo } from "./transaction/AccountNetworkInfo"
import { DappHeader } from "./transaction/DappHeader"
import { TransactionsList } from "./transaction/TransactionsList"
import { TxHashContainer } from "./TxHashContainer"
import { useTranslation } from "react-i18next"
import { tryBuildChainedTransactions, tryBuildTransactions } from "../../../shared/transactions"
import { IconButton } from "@mui/material"
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"
import { getAccounts } from "../../../shared/account/store"
import { accountsOnNetwork } from "../../services/backgroundAccounts"
import { useAccount, useSelectedAccount } from "../accounts/accounts.state"

const { AlertIcon } = icons

const LedgerStatus = ({ ledgerState }: { ledgerState: string | undefined }): JSX.Element => {
  const { t } = useTranslation()
  return (
    ledgerState === "notfound" ?
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
          <L1 color="errorText">{t("The Ledger app is not connected")}</L1>
        </Flex>
      </Flex>
      : <></>
  )
}

export interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transactionParams: TransactionParams[]
  onSubmit: (
    result:
      | (ReviewTransactionResult & { signature?: string } | { error: string })[]
      | undefined,
  ) => void
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transactionParams,
  actionHash,
  onSubmit,
  onReject,
  ...props
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const selectedAccount = useSelectedAccount()

  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [buildResults, setBuildResults] = useState<
    ReviewTransactionResult[] | undefined
  >()
  const { id: networkId, nodeUrl } = useNetwork(
    selectedAccount?.networkId ?? "unknown",
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const useLedger = selectedAccount !== undefined && selectedAccount.signer.type === "ledger"
  const [ledgerState, setLedgerState] = useState<
    "detecting" | "notfound" | "signing" | "succeeded" | "failed"
  >()
  const [ledgerApp, setLedgerApp] = useState<LedgerApp>()
  const { tokenDetails: allUserTokens, tokenDetailsIsInitialising } = useAllTokensWithBalance(selectedAccount)

  // TODO: handle error
  useEffect(() => {
    const build = async () => {
      if (selectedAccount === undefined || tokenDetailsIsInitialising) {
        return
      }

      try {
        const walletAccounts = await getAccounts((account) => {
          return account.networkId === selectedAccount.networkId && !account.hidden
        })

        let results: ReviewTransactionResult[]
        if (transactionParams.length === 0) {
          throw new Error("Transaction params are empty")
        } else if (transactionParams.length === 1) {
          results = await tryBuildTransactions(
            nodeUrl,
            allUserTokens,
            selectedAccount,
            walletAccounts,
            transactionParams[0],
            useLedger
          )
        } else {
          if (useLedger) {
            throw new Error("Ledger does not support chained transactions")
          }
          results = await tryBuildChainedTransactions(nodeUrl, walletAccounts, transactionParams)
        }

        setBuildResults(results)
      } catch (e: any) {
        useAppState.setState({
          error: `${t("Transaction building failed")}: ${e.toString()}`,
          isLoading: false,
        })
        rejectAction(actionHash, `${e}`)
        navigate(routes.error())
      }
    }

    build()
  }, [nodeUrl, selectedAccount, transactionParams, tokenDetailsIsInitialising, actionHash, navigate, t])

  const ledgerSign = useCallback(async () => {
    if (selectedAccount === undefined) {
      return
    }
    setLedgerState(oldState => oldState === undefined ? "detecting" : oldState)

    if (buildResults) {
      let app: LedgerApp | undefined
      try {
        if (buildResults.length !== 1) {
          throw new Error("Ledger does not support chained transactions")
        }
        const buildResult = buildResults[0]

        app = await getLedgerApp()
        setLedgerApp(app)
        setLedgerState("signing")
        const path = getHDWalletPath(
          selectedAccount.signer.keyType,
          selectedAccount.signer.derivationIndex,
        )
        const unsignedTx = Buffer.from(buildResult.result.unsignedTx, "hex")
        const signature = await app.signUnsignedTx(path, unsignedTx)
        setLedgerState("succeeded")
        onSubmit([{ ...buildResult, signature }])
        await app.close()
      } catch (e) {
        if (app === undefined) {
          setLedgerState(oldState => oldState === undefined || oldState === "detecting" ? "notfound" : oldState)
          setTimeout(ledgerSign, 1000)
        } else {
          await app.close()
          setLedgerState("failed")
          if (onReject !== undefined) {
            onReject()
          } else {
            navigate(-1)
          }
        }
      }
    }
  }, [selectedAccount, buildResults, onSubmit, onReject, navigate])

  if (!selectedAccount) {
    rejectAction(actionHash, t("No account found for network {{ networkId }}", { networkId }))
    return <Navigate to={routes.accounts()} />
  }

  if (buildResults === undefined) {
    return <LoadingScreen />
  }

  return (
    <ConfirmScreen
      confirmButtonText={
        !useLedger
          ? t("Sign")
          : ledgerState === undefined
          ? t("Sign with Ledger")
          : (ledgerState === "detecting") || (ledgerState === "notfound")
          ? t("Ledger: Detecting")
          : ledgerState === "signing"
          ? t("Ledger: Signing")
          : ledgerState === "succeeded"
          ? t("Ledger: Succeeded")
          : ledgerState === "failed"
          ? t("Ledger: Failed")
          : ledgerState
      }
      confirmButtonDisabled={ledgerState !== undefined}
      rejectButtonText={t("Cancel")}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        if (useLedger) {
          ledgerSign()
        } else {
          onSubmit(buildResults)
        }
      }}
      onReject={() => {
        if (ledgerApp !== undefined) {
          ledgerApp.close()
        }
        if (onReject !== undefined) {
          onReject()
        } else {
          navigate(-1)
        }
      }}
      showHeader={false}
      footer={
        buildResults.length > 0 && (
          <Flex direction="column" gap="1">
            <LedgerStatus ledgerState={ledgerState} />
            <FeeEstimation
              onErrorChange={() => {
                return
              }}
              accountAddress={buildResults[currentIndex].params.signerAddress}
              networkId={buildResults[currentIndex].params.networkId}
              transaction={buildResults[currentIndex]}
              actionHash={actionHash}
            />
          </Flex>
        )
      }
      {...props}
    >
      <DappHeader transaction={buildResults[currentIndex]} />
      <TransactionsList networkId={networkId} transactionReview={buildResults[currentIndex]} />
      <AccountNetworkInfo accountAddress={buildResults[currentIndex].params.signerAddress} networkId={networkId} />
      <TxHashContainer txId={buildResults[currentIndex].result.txId}></TxHashContainer>
      {
        buildResults.length > 1 && (
          <Flex direction="column" align="center">
            <Flex>
              <IconButton
                aria-label="Previous transaction"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                size="small"
              >
              <ChevronLeftIcon />
              </IconButton>
              <Flex justify="center" align="center" mx={2}>
                <Text fontSize="sm" fontWeight="medium">
                  {`${currentIndex + 1} of ${buildResults.length}`}
                </Text>
              </Flex>
              <IconButton
                aria-label="Next transaction"
                onClick={() => setCurrentIndex(prev => Math.min(buildResults.length - 1, prev + 1))}
                disabled={currentIndex === buildResults.length - 1}
                size="small"
              >
              <ChevronRightIcon />
              </IconButton>
            </Flex>
          </Flex>
        )
      }
    </ConfirmScreen>
  )
}
