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
import { useAccount, useSelectedAccount } from "../accounts/accounts.state"
import { LedgerStatus } from "./LedgerStatus"
import { useLedgerApp } from "../ledger/useLedgerApp"
import { getConfirmationTextByState } from "../ledger/types"

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
  const selectedAccount0 = useSelectedAccount()

  const getSignerAccount = useCallback(() => {
    if (transactionParams.length == 1) {
      return {
        address: transactionParams[0].params.signerAddress,
        networkId: transactionParams[0].params.networkId
      }
    }
    return undefined
  }, [transactionParams])

  const signerAccount = useAccount(getSignerAccount())
  const selectedAccount = signerAccount ?? selectedAccount0

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
  const { tokenDetails: allUserTokens, tokenDetailsIsInitialising } = useAllTokensWithBalance(selectedAccount)

  const useLedger = selectedAccount !== undefined && selectedAccount.signer.type === "ledger"
  const ledgerSubmit = useCallback((signature: string) => {
    if (buildResults) {
      if (buildResults.length !== 1) {
        throw new Error("Ledger does not support chained transactions")
      }

      const buildResult = buildResults[0]
      onSubmit([{ ...buildResult, signature }])
    }
  }, [onSubmit, buildResults])
  const { ledgerState, ledgerApp, ledgerSign } = useLedgerApp({
    selectedAccount,
    unsignedTx: buildResults?.[0].result.unsignedTx,
    onSubmit: ledgerSubmit,
    navigate,
    onReject
  })

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

  const getButtonConfig = () => {
    // Single transaction case - use default behavior
    if (buildResults?.length === 1) {
      return {
        confirmButtonText: !useLedger ? t("Sign") : t(getConfirmationTextByState(ledgerState)),
        rejectButtonText: t("Cancel"),
        onConfirm: () => {
          if (useLedger) {
            ledgerSign()
          } else {
            onSubmit(buildResults)
          }
        },
        onReject: () => {
          if (ledgerApp !== undefined) {
            ledgerApp.close()
          }
          if (onReject !== undefined) {
            onReject()
          } else {
            navigate(-1)
          }
        }
      }
    }

    // Multiple transactions case
    if (currentIndex === 0) {
      return {
        confirmButtonText: t("Next"),
        rejectButtonText: t("Cancel"),
        onConfirm: () => setCurrentIndex(prev => prev + 1),
        onReject: () => {
          if (onReject !== undefined) {
            onReject()
          } else {
            navigate(-1)
          }
        }
      }
    }

    if (currentIndex === buildResults!.length - 1) {
      return {
        confirmButtonText: !useLedger ? t("Sign") : t(getConfirmationTextByState(ledgerState)),
        rejectButtonText: t("Back"),
        onConfirm: () => {
          if (useLedger) {
            ledgerSign()
          } else {
            onSubmit(buildResults)
          }
        },
        onReject: () => setCurrentIndex(prev => prev - 1)
      }
    }

    // Middle transactions
    return {
      confirmButtonText: t("Next"),
      rejectButtonText: t("Back"),
      onConfirm: () => setCurrentIndex(prev => prev + 1),
      onReject: () => setCurrentIndex(prev => prev - 1)
    }
  }

  if (!selectedAccount) {
    rejectAction(actionHash, t("No account found for network {{ networkId }}", { networkId }))
    return <Navigate to={routes.accounts()} />
  }

  if (buildResults === undefined) {
    return <LoadingScreen />
  }

  const buttonConfig = getButtonConfig()

  return (
    <ConfirmScreen
      confirmButtonText={buttonConfig.confirmButtonText}
      confirmButtonDisabled={ledgerState !== undefined}
      rejectButtonText={buttonConfig.rejectButtonText}
      selectedAccount={selectedAccount}
      onSubmit={buttonConfig.onConfirm}
      onReject={buttonConfig.onReject}
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
      {buildResults.length > 1 && (
        <Flex justify="center" mb={2} mt={-2}>
          <Text fontSize="sm" fontWeight="medium">
            {`${currentIndex + 1} / ${buildResults.length}`}
          </Text>
        </Flex>
      )}
      <TransactionsList networkId={networkId} transactionReview={buildResults[currentIndex]} />
      <AccountNetworkInfo accountAddress={buildResults[currentIndex].params.signerAddress} networkId={networkId} />
      <TxHashContainer txId={buildResults[currentIndex].result.txId}></TxHashContainer>
    </ConfirmScreen>
  )
}
