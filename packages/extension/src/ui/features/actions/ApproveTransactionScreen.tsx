import LedgerApp from "@alephium/ledger-app"
import { ALPH_TOKEN_ID, ONE_ALPH, prettifyTokenAmount, TransactionBuilder } from "@alephium/web3"
import { getHDWalletPath } from "@alephium/web3-wallet"
import { L1, icons } from "@argent/ui"
import { Flex, Text } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useNavigate } from "react-router-dom"

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
import { getToken } from "../../../shared/token/storage"
import { BigNumber } from "ethers"
import { addTokenToBalances } from "../../../shared/token/balance"

const { AlertIcon } = icons

const LedgerStatus = ({ ledgerState }: { ledgerState: string | undefined }): JSX.Element => (
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
        <L1 color="errorText">The ledger app is not connected</L1>
      </Flex>
    </Flex>
    : <></>
)

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
        result: await builder.buildUnsignedTx(transaction.params),
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
      return `Insufficient token ${tokenSymbol}, expected at least ${expectedStr}, got ${haveStr}`
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

  const useLedger =
    selectedAccount !== undefined && selectedAccount.signer.type === "ledger"
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
        const buildResult = await tryBuildTransaction(
          nodeUrl,
          allUserTokens,
          selectedAccount,
          transaction
        )
        setBuildResult(buildResult)
      } catch (e: any) {
        useAppState.setState({
          error: `Failed in building transaction: ${e.toString()}`,
          isLoading: false,
        })
        rejectAction(actionHash)
        navigate(routes.error())
      }
    }

    build()
  }, [nodeUrl, selectedAccount, transaction, tokenDetailsIsInitialising, actionHash, navigate])

  const ledgerSign = useCallback(async () => {
    if (selectedAccount === undefined) {
      return
    }
    setLedgerState(oldState => oldState === undefined ? "detecting" : oldState)

    if (buildResult) {
      let app: LedgerApp | undefined
      try {
        app = await getLedgerApp()
        setLedgerApp(app)
        setLedgerState("signing")
        const path = getHDWalletPath(
          selectedAccount.signer.keyType,
          selectedAccount.signer.derivationIndex,
        )
        const signature = await app.signHash(
          path,
          Buffer.from(buildResult.result.txId, "hex"),
        )
        setLedgerState("succeeded")
        onSubmit({ ...buildResult, signature })
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
  }, [selectedAccount, buildResult, onSubmit, onReject, navigate])

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  if (!buildResult) {
    return <LoadingScreen />
  }

  return (
    <ConfirmScreen
      confirmButtonText={
        !useLedger
          ? "Sign"
          : ledgerState === undefined
          ? "Sign with Ledger"
          : (ledgerState === "detecting") || (ledgerState === "notfound")
          ? "Ledger: Detecting"
          : ledgerState === "signing"
          ? "Ledger: Signing"
          : ledgerState === "succeeded"
          ? "Ledger: Succeeded"
          : ledgerState === "failed"
          ? "Ledger: Failed"
          : ledgerState
      }
      confirmButtonDisabled={ledgerState !== undefined}
      rejectButtonText="Cancel"
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
