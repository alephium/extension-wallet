import { ALPH_TOKEN_ID, ONE_ALPH, prettifyTokenAmount, TransactionBuilder } from "@alephium/web3"
import { Flex } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import {
  ReviewTransactionResult,
  TransactionParams,
} from "../../../shared/actionQueue/types"
import { BaseTokenWithBalance } from "../../../shared/token/type"
import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { rejectAction } from "../../services/backgroundActions"
import { Account } from "../accounts/Account"
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
import { getToken } from "../../../shared/token/storage"
import { BigNumber } from "ethers"
import { addTokenToBalances } from "../../../shared/token/balance"
import { useTranslation } from "react-i18next"
import i18n from "../../../i18n"
import { LedgerStatus } from "./LedgerStatus"
import { useLedgerApp } from "../ledger/useLedgerApp"
import { getConfirmationTextByState } from "../ledger/types"

const minimalGasFee = BigInt(20000) * BigInt(100000000000)

export interface ApproveTransactionScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  transaction: TransactionParams
  onSubmit: (
    result:
      | (ReviewTransactionResult & { signature?: string })
      | { error: string }
      | undefined,
  ) => void
}

async function tryBuildTransaction(
  nodeUrl: string,
  tokensWithBalance: BaseTokenWithBalance[],
  account: Account,
  transaction: TransactionParams
): Promise<ReviewTransactionResult> {
  const builder = TransactionBuilder.from(nodeUrl)
  try {
    return await buildTransaction(builder, account, transaction)
  } catch (error) {
    const errMsg = await checkBalances(tokensWithBalance, transaction, account.networkId)
    if (errMsg !== undefined) {
      throw new Error(errMsg)
    }
    throw error
  }
}

async function buildTransaction(
  builder: TransactionBuilder,
  account: Account,
  transaction: TransactionParams
): Promise<ReviewTransactionResult> {
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
        result: TransactionBuilder.buildUnsignedTx(transaction.params),
      }
  }
}

export async function checkBalances(
  tokensWithBalance: BaseTokenWithBalance[],
  transaction: TransactionParams,
  networkId: string
): Promise<string | undefined> {
  const expectedBalances: Map<string, BigNumber> = new Map()
  switch (transaction.type) {
    case 'TRANSFER':
      transaction.params.destinations.forEach((destination) => {
        addTokenToBalances(expectedBalances, ALPH_TOKEN_ID, BigNumber.from(destination.attoAlphAmount))
        if (destination.tokens !== undefined) {
          destination.tokens.forEach((token) => addTokenToBalances(expectedBalances, token.id, BigNumber.from(token.amount)))
        }
      })
      break
    case 'DEPLOY_CONTRACT':
      addTokenToBalances(expectedBalances, ALPH_TOKEN_ID,
        transaction.params.initialAttoAlphAmount !== undefined
          ? BigNumber.from(transaction.params.initialAttoAlphAmount)
          : BigNumber.from(ONE_ALPH)
      )
      if (transaction.params.initialTokenAmounts !== undefined) {
        transaction.params.initialTokenAmounts.forEach((token) => addTokenToBalances(expectedBalances, token.id, BigNumber.from(token.amount)))
      }
      break
    case 'EXECUTE_SCRIPT':
      if (transaction.params.attoAlphAmount !== undefined) {
        addTokenToBalances(expectedBalances, ALPH_TOKEN_ID, BigNumber.from(transaction.params.attoAlphAmount))
      }
      if (transaction.params.tokens !== undefined) {
        transaction.params.tokens.forEach((token) => addTokenToBalances(expectedBalances, token.id, BigNumber.from(token.amount)))
      }
      break
    case 'UNSIGNED_TX':
      return
  }
  addTokenToBalances(expectedBalances, ALPH_TOKEN_ID, BigNumber.from(minimalGasFee))

  const zero = BigNumber.from(0)
  for (const [tokenId, amount] of expectedBalances) {
    if (zero.eq(amount)) {
      continue
    }
    const token = tokensWithBalance.find((t) => t.id === tokenId)
    const tokenBalance = token?.balance
    if (tokenBalance === undefined || tokenBalance.lt(amount)) {
      const tokenInfo = await getToken({ id: tokenId, networkId })
      const tokenSymbol = tokenInfo?.symbol ?? tokenId
      const tokenDecimals = tokenInfo?.decimals ?? 0
      const expectedStr = prettifyTokenAmount(amount.toBigInt(), tokenDecimals)
      const haveStr = prettifyTokenAmount((tokenBalance ?? zero).toBigInt(), tokenDecimals)
      return i18n.t("Insufficient token {{ tokenSymbol }}, expected at least {{ expectedStr }}, got {{ haveStr }}", { tokenSymbol, expectedStr, haveStr })
    }
  }
  return undefined
}

export const ApproveTransactionScreen: FC<ApproveTransactionScreenProps> = ({
  transaction,
  selectedAccount,
  actionHash,
  onSubmit,
  onReject,
  ...props
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [buildResult, setBuildResult] = useState<
    ReviewTransactionResult | undefined
  >()
  const { id: networkId, nodeUrl } = useNetwork(
    selectedAccount?.networkId ?? "unknown",
  )

  const { tokenDetails: allUserTokens, tokenDetailsIsInitialising } = useAllTokensWithBalance(selectedAccount)

  const useLedger = selectedAccount !== undefined && selectedAccount.signer.type === "ledger"
  const ledgerSubmit = useCallback((signature: string) => {
    if (buildResult) {
      onSubmit({ ...buildResult, signature })
    }
  }, [onSubmit, buildResult])
  const { ledgerState, ledgerApp, ledgerSign } = useLedgerApp({
    selectedAccount,
    unsignedTx: buildResult?.result.unsignedTx,
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
        const buildResult = await tryBuildTransaction(
          nodeUrl,
          allUserTokens,
          selectedAccount,
          transaction
        )
        setBuildResult(buildResult)
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
  }, [nodeUrl, selectedAccount, transaction, tokenDetailsIsInitialising, actionHash, navigate, t])

  if (!selectedAccount) {
    rejectAction(actionHash, t("No account found for network {{ networkId }}", { networkId }))
    return <Navigate to={routes.accounts()} />
  }

  if (!buildResult) {
    return <LoadingScreen />
  }

  return (
    <ConfirmScreen
      confirmButtonText={!useLedger ? t("Sign") : t(getConfirmationTextByState(ledgerState))}
      confirmButtonDisabled={ledgerState !== undefined}
      rejectButtonText={t("Cancel")}
      selectedAccount={selectedAccount}
      onSubmit={() => {
        if (useLedger) {
          ledgerSign()
        } else {
          onSubmit(buildResult)
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
        buildResult && (
          <Flex direction="column" gap="1">
            <LedgerStatus ledgerState={ledgerState} />
            <FeeEstimation
              onErrorChange={() => {
                return
              }}
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
      <TxHashContainer txId={buildResult.result.txId}></TxHashContainer>
    </ConfirmScreen>
  )
}
