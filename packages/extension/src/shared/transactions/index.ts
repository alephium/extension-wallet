import { ALPH_TOKEN_ID, DEFAULT_GAS_PRICE, DUST_AMOUNT, ExplorerProvider, MINIMAL_CONTRACT_DEPOSIT, NodeProvider, SignTransferChainedTxParams, TransactionBuilder } from "@alephium/web3"
import { lowerCase, upperFirst } from "lodash-es"
import { Call } from "starknet"
import { ReviewTransactionResult, TransactionParams } from "../actionQueue/types"
import { WalletAccount } from "../wallet.model"
import { AlephiumExplorerTransaction } from "../explorer/type"
import { mapAlephiumTransactionToTransaction, signedChainedTxResultToReviewTransactionResult, transactionParamsToSignChainedTxParams } from "./transformers"
import { getNetwork } from "../network"
import { BaseTokenWithBalance } from "../token/type"
import { BigNumber } from "ethers"
import { addTokenToBalances, getBalances } from "../token/balance"
import i18n from "../../i18n"

export type Status = 'NOT_RECEIVED' | 'RECEIVED' | 'PENDING' | 'ACCEPTED_ON_MEMPOOL' | 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_CHAIN' | 'REJECTED' | 'REMOVED_FROM_MEMPOOL';

// Global Constants for Transactions
export const SUCCESS_STATUSES: Status[] = [
  "ACCEPTED_ON_MEMPOOL",
  "ACCEPTED_ON_CHAIN",
  "ACCEPTED_ON_L2",
  "PENDING",
]

export const TRANSACTION_STATUSES_TO_TRACK: Status[] = [
  "RECEIVED",
  "ACCEPTED_ON_MEMPOOL",
  "NOT_RECEIVED",
]

export interface TransactionMeta {
  title?: string
  subTitle?: string
  transactions?: Call | Call[] // TODO: remove this
  type?: string // TODO: in future can be DECLARE | DEPLOY | CALL
  request?: ReviewTransactionResult
  explorer?: AlephiumExplorerTransaction
}

export interface TransactionBase {
  hash: string
  account: {
    networkId: string
  }
}

export interface TransactionRequest extends TransactionBase {
  account: WalletAccount
  meta?: TransactionMeta
}

export interface Transaction extends TransactionRequest {
  status: Status
  failureReason?: { code: string; error_message: string }
  timestamp: number
}

export const compareTransactions = (
  a: TransactionBase,
  b: TransactionBase,
): boolean => a.hash === b.hash && a.account.networkId === a.account.networkId

export function entryPointToHumanReadable(entryPoint: string): string {
  try {
    return upperFirst(lowerCase(entryPoint))
  } catch {
    return entryPoint
  }
}

export const getInFlightTransactions = (
  transactions: Transaction[],
): Transaction[] =>
  transactions.filter(
    ({ status }) =>
      TRANSACTION_STATUSES_TO_TRACK.includes(status)
  )

export function nameTransaction(calls: Call | Call[]) {
  const callsArray = Array.isArray(calls) ? calls : [calls]
  const entrypointNames = callsArray.map((call) => call.entrypoint)
  return transactionNamesToTitle(entrypointNames)
}

export function transactionNamesToTitle(
  names: string | string[],
): string | undefined {
  if (!Array.isArray(names)) {
    names = [names]
  }
  const entrypointNames = names.map((name) => lowerCase(name))
  const lastName = entrypointNames.pop()
  const title = entrypointNames.length
    ? `${entrypointNames.join(", ")} and ${lastName}`
    : lastName
  return upperFirst(title)
}

// ===== ALPH ======
export async function getTransactionsPerAccount(
  accountsToPopulate: WalletAccount[],
  metadataTransactions: Transaction[],
): Promise<Map<WalletAccount, Transaction[]>> {
  const getTransactions = buildGetTransactionsFn(metadataTransactions)
  const transactionsPerAccount = new Map<WalletAccount, Transaction[]>()
  await Promise.all(
    accountsToPopulate.map(async (account) => {
      const transactions = await getTransactions(account)
      transactionsPerAccount.set(account, transactions)
    }),
  )

  return transactionsPerAccount
}

// Fetch 1 tx
function buildGetTransactionsFn(metadataTransactions: Transaction[]) {
  return async (account: WalletAccount) => {
    const limit = 1
    const network = await getNetwork(account.networkId)
    const explorerProvider = new ExplorerProvider(network.explorerApiUrl)
    const transactions = await explorerProvider.addresses.getAddressesAddressTransactions(account.address, { page: 1, limit })
    return transactions.map((transaction) =>
      mapAlephiumTransactionToTransaction(
        transaction,
        account,
        metadataTransactions.find((tx) =>
          compareTransactions(tx, {
            hash: transaction.hash,
            account: { networkId: account.networkId },
          }),
        )?.meta,
      ),
    )
  }
}

export async function tryBuildChainedTransactions(
  nodeUrl: string,
  walletAccounts: WalletAccount[],
  transactionParams: TransactionParams[]
): Promise<ReviewTransactionResult[]> {
  try {
    if (transactionParams.length === 0) {
      throw new Error("Transaction params are empty");
    }
    const networkId = transactionParams[0].params.networkId
    if (transactionParams.some((params) => params.params.networkId !== networkId)) {
      throw new Error(`All transaction params must have the same networkId ${networkId}`)
    }

    const builder = TransactionBuilder.from(nodeUrl)
    const chainedParams = transactionParams.map((params) => transactionParamsToSignChainedTxParams(params))
    const publicKeys = transactionParams.map((params) => {
      const account = walletAccounts.find(acc => acc.address === params.params.signerAddress && acc.networkId === networkId)
      if (!account) {
        throw new Error(`No wallet account found for address ${params.params.signerAddress} in ${networkId} network`)
      }
      return account.signer.publicKey
    })
    const chainedTxResults = await builder.buildChainedTx(chainedParams, publicKeys)
    return chainedTxResults.map((signedChainedTxResult, index) => {
      return signedChainedTxResultToReviewTransactionResult(chainedParams[index], signedChainedTxResult, networkId)
    })
  } catch (error) {
    console.log("Error building chained transaction", error)
    throw error
  }
}

export async function tryBuildTransactions(
  nodeUrl: string,
  tokensWithBalance: BaseTokenWithBalance[],
  selectedAccount: WalletAccount,
  allAccounts: WalletAccount[],
  transactionParams: TransactionParams,
  useLedger: boolean
): Promise<ReviewTransactionResult[]> {
  const builder = TransactionBuilder.from(nodeUrl)
  try {
    const transaction: ReviewTransactionResult = await buildTransaction(builder, selectedAccount, transactionParams)
    return [transaction]
  } catch (error) {
    console.log("Error building transaction", error)
    const missingBalances = await checkBalances(tokensWithBalance, transactionParams)
    const isDAppTransaction = transactionParams.type === 'EXECUTE_SCRIPT' || transactionParams.type === 'DEPLOY_CONTRACT'

    if (missingBalances !== undefined) {
      if (isDAppTransaction && !useLedger) {
        const restOfAccounts = allAccounts.filter((account) => account.address !== selectedAccount.address)
        const nodeProvider = new NodeProvider(nodeUrl)
        const account = await accountWithEnoughBalance(missingBalances, restOfAccounts, nodeProvider)

        if (account !== undefined) {
          const tokens = Array.from(missingBalances.entries())
            .filter(([tokenId]) => tokenId !== ALPH_TOKEN_ID)
            .map(([tokenId, amount]) => ({
              id: tokenId,
              amount: amount.toString()
            }))
          const attoAlphAmount = missingBalances.get(ALPH_TOKEN_ID)?.toString() || DUST_AMOUNT * BigInt(tokens.length)
          const transferTransactionParams: SignTransferChainedTxParams = {
            type: 'Transfer',
            signerAddress: account.address,
            signerKeyType: account.signer.keyType,
            destinations: [{
              address: selectedAccount.address,
              attoAlphAmount,
              tokens
            }]
          }

          const dappTransactionParams = transactionParamsToSignChainedTxParams(transactionParams)
          const chainedTxParams = [transferTransactionParams, dappTransactionParams]
          const chainedTxResults = await builder.buildChainedTx(
            chainedTxParams,
            [account.signer.publicKey, selectedAccount.signer.publicKey]
          )

          const reviewTxResults = chainedTxParams.map((params, index) => {
            return signedChainedTxResultToReviewTransactionResult(params, chainedTxResults[index], account.networkId)
          })

          return reviewTxResults
        }
      }

      const [firstMissingTokenId, firstMissingAmount] = missingBalances.entries().next().value;
      const tokenSymbol = firstMissingTokenId === ALPH_TOKEN_ID ? 'ALPH' : firstMissingTokenId;
      const expectedStr = firstMissingAmount.toString();
      const haveStr = (tokensWithBalance.find(t => t.id === firstMissingTokenId)?.balance || '0').toString();
      const errorMsg = i18n.t("Insufficient token {{ tokenSymbol }}, expected at least {{ expectedStr }}, got {{ haveStr }}", { tokenSymbol, expectedStr, haveStr })
      throw new Error(errorMsg)
    }

    throw error
  }
}

async function accountWithEnoughBalance(
  missingBalances: Map<string, BigNumber>,
  accounts: WalletAccount[],
  nodeProvider: NodeProvider
): Promise<WalletAccount | undefined> {
  for (const account of accounts) {
    const accountBalances = await getBalances(nodeProvider, account.address)
    let hasEnoughBalance = true;
    for (const [tokenId, amount] of missingBalances) {
      const balance = accountBalances.get(tokenId);
      if (!balance || balance.lt(amount)) {
        hasEnoughBalance = false;
        break;
      }
    }

    if (hasEnoughBalance) {
      return account
    }
  }
  return undefined
}


async function buildTransaction(
  builder: TransactionBuilder,
  account: WalletAccount,
  transactionParams: TransactionParams
): Promise<ReviewTransactionResult> {
  switch (transactionParams.type) {
    case "TRANSFER":
      return {
        type: transactionParams.type,
        params: transactionParams.params,
        result: await builder.buildTransferTx(
          transactionParams.params,
          account.signer.publicKey,
        ),
      }
    case "DEPLOY_CONTRACT":
      return {
        type: transactionParams.type,
        params: transactionParams.params,
        result: await builder.buildDeployContractTx(
          transactionParams.params,
          account.signer.publicKey,
        ),
      }
    case "EXECUTE_SCRIPT":
      return {
        type: transactionParams.type,
        params: transactionParams.params,
        result: await builder.buildExecuteScriptTx(
          transactionParams.params,
          account.signer.publicKey,
        ),
      }
    case "UNSIGNED_TX":
      return {
        type: transactionParams.type,
        params: transactionParams.params,
        result: await builder.buildUnsignedTx(transactionParams.params),
      }
  }
}

export async function checkBalances(
  tokensWithBalance: BaseTokenWithBalance[],
  transactionParams: TransactionParams
): Promise<Map<string, BigNumber> | undefined> {
  const expectedBalances: Map<string, BigNumber> = new Map()

  switch (transactionParams.type) {
    case 'TRANSFER':
      transactionParams.params.destinations.forEach((destination) => {
        addTokenToBalances(expectedBalances, ALPH_TOKEN_ID, BigNumber.from(destination.attoAlphAmount))
        if (destination.tokens !== undefined) {
          destination.tokens.forEach((token) => addTokenToBalances(expectedBalances, token.id, BigNumber.from(token.amount)))
        }
      })
      break
    case 'DEPLOY_CONTRACT':
      addTokenToBalances(expectedBalances, ALPH_TOKEN_ID,
        transactionParams.params.initialAttoAlphAmount !== undefined
          ? BigNumber.from(transactionParams.params.initialAttoAlphAmount)
          : BigNumber.from(MINIMAL_CONTRACT_DEPOSIT)
      )
      if (transactionParams.params.initialTokenAmounts !== undefined) {
        transactionParams.params.initialTokenAmounts.forEach((token) => addTokenToBalances(expectedBalances, token.id, BigNumber.from(token.amount)))
      }
      break
    case 'EXECUTE_SCRIPT':
      if (transactionParams.params.attoAlphAmount !== undefined) {
        addTokenToBalances(expectedBalances, ALPH_TOKEN_ID, BigNumber.from(transactionParams.params.attoAlphAmount))
      }
      if (transactionParams.params.tokens !== undefined) {
        transactionParams.params.tokens.forEach((token) => addTokenToBalances(expectedBalances, token.id, BigNumber.from(token.amount)))
      }

      break
    case 'UNSIGNED_TX':
      return
  }

  const maxGasAmountPerTx = 5000000
  const gasFee = BigInt(transactionParams.params.gasAmount ?? maxGasAmountPerTx) * BigInt(transactionParams.params.gasPrice ?? DEFAULT_GAS_PRICE)
  addTokenToBalances(expectedBalances, ALPH_TOKEN_ID, BigNumber.from(gasFee))

  const zero = BigNumber.from(0)
  const missingBalances: Map<string, BigNumber> = new Map()
  for (const [tokenId, amount] of expectedBalances) {
    if (zero.eq(amount)) {
      continue
    }
    const token = tokensWithBalance.find((t) => t.id === tokenId)
    const tokenBalance = token?.balance
    if (tokenBalance === undefined || tokenBalance.lt(amount)) {
      missingBalances.set(tokenId, amount.sub(tokenBalance ?? zero))
    }
  }
  if (missingBalances.size > 0) {
    return missingBalances
  }
  return undefined
}
