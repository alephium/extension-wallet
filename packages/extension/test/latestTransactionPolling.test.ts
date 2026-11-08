import type { ExplorerProvider as ExplorerProviderType } from "@alephium/web3"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import type { Network } from "../src/shared/network"
import type { Transaction } from "../src/shared/transactions"
import type { WalletAccount } from "../src/shared/wallet.model"

let ExplorerProvider: typeof import("@alephium/web3").ExplorerProvider
let transactionTracker: typeof import("../src/background/transactions/tracking").transactionTracker
let getNetwork: typeof import("../src/shared/network").getNetwork
let transactionsStore: typeof import("../src/shared/transactions/store").transactionsStore
let mapAlephiumTransactionToTransaction: typeof import("../src/shared/transactions/transformers").mapAlephiumTransactionToTransaction

// Load the tracker after registering boundary mocks on the locked Vitest version.
beforeAll(async () => {
  vi.doMock("@alephium/web3", () => ({ ExplorerProvider: vi.fn() }))
  vi.doMock("../src/shared/network/index.ts", () => ({ getNetwork: vi.fn() }))
  vi.doMock("../src/shared/wallet.service.ts", () => ({
    accountsEqual: (a: WalletAccount, b: WalletAccount) =>
      a.address === b.address && a.networkId === b.networkId,
  }))
  vi.doMock("../src/shared/transactions/store.ts", () => ({
    transactionsStore: { get: vi.fn(), push: vi.fn(), remove: vi.fn() },
  }))
  vi.doMock("../src/shared/transactions/transformers.ts", () => ({
    mapAlephiumTransactionToTransaction: vi.fn(),
  }))
  vi.doMock("../src/shared/token/balance.ts", () => ({
    addTokenToBalances: vi.fn(),
    getBalances: vi.fn(),
  }))
  vi.doMock("../src/shared/token/storage.ts", () => ({ tokenListStore: {} }))
  vi.doMock("../src/i18n.ts", () => ({ default: { t: vi.fn() } }))

  ExplorerProvider = (await import("@alephium/web3")).ExplorerProvider
  getNetwork = (await import("../src/shared/network")).getNetwork
  transactionsStore = (await import("../src/shared/transactions/store"))
    .transactionsStore
  mapAlephiumTransactionToTransaction = (
    await import("../src/shared/transactions/transformers")
  ).mapAlephiumTransactionToTransaction
  transactionTracker = (await import("../src/background/transactions/tracking"))
    .transactionTracker
})

const account: WalletAccount = {
  address: "test-address",
  networkId: "mainnet",
  type: "alephium",
  signer: {
    type: "local_secret",
    keyType: "default",
    publicKey: "test-public-key",
    derivationIndex: 0,
    group: 0,
  },
}
const overview = {
  hash: "confirmed-transaction",
  blockHash: "confirmed-block",
  timestamp: 1700000000000,
  coinbase: false,
}
const stored: Transaction = {
  hash: overview.hash,
  timestamp: overview.timestamp,
  account,
  status: "ACCEPTED_ON_CHAIN",
  meta: { title: "Existing transaction" },
}
const latest = vi.fn()
const fullHistory = vi.fn()
const details = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getNetwork).mockResolvedValue({
    explorerApiUrl: "https://explorer.example.invalid",
  } as Network)
  vi.mocked(ExplorerProvider).mockImplementation(
    () =>
      ({
        addresses: {
          getAddressesAddressLatestTransaction: latest,
          getAddressesAddressTransactions: fullHistory,
        },
        transactions: { getTransactionsTransactionHash: details },
      } as unknown as ExplorerProviderType),
  )
  vi.mocked(transactionsStore.get).mockResolvedValue([])
  latest.mockResolvedValue(overview)
  details.mockResolvedValue({
    type: "Accepted",
    hash: overview.hash,
    blockHash: overview.blockHash,
    timestamp: overview.timestamp,
    inputs: [],
    outputs: [],
  })
  vi.mocked(mapAlephiumTransactionToTransaction).mockReturnValue(stored)
})

describe("background latest-transaction polling", () => {
  it("polls the lightweight endpoint and loads details only for a new transaction", async () => {
    await transactionTracker.loadHistory([account])

    expect(latest).toHaveBeenCalledOnce()
    expect(latest).toHaveBeenCalledWith(account.address)
    expect(fullHistory).not.toHaveBeenCalled()
    expect(details).toHaveBeenCalledOnce()
    expect(details).toHaveBeenCalledWith(overview.hash)
    expect(transactionsStore.push).toHaveBeenCalledWith([stored])
    expect(transactionsStore.remove).not.toHaveBeenCalled()
  })

  it("does not load transaction details or mutate storage when the hash is unchanged", async () => {
    vi.mocked(transactionsStore.get).mockResolvedValue([stored])

    await transactionTracker.loadHistory([account])

    expect(latest).toHaveBeenCalledOnce()
    expect(fullHistory).not.toHaveBeenCalled()
    expect(details).not.toHaveBeenCalled()
    expect(transactionsStore.push).not.toHaveBeenCalled()
    expect(transactionsStore.remove).not.toHaveBeenCalled()
  })

  it("treats an empty-history 404 as no update without deleting existing transactions", async () => {
    vi.mocked(transactionsStore.get).mockResolvedValue([stored])
    latest.mockRejectedValue(
      new Error("Status code: 404, transaction not found"),
    )

    await transactionTracker.loadHistory([account])

    expect(fullHistory).not.toHaveBeenCalled()
    expect(details).not.toHaveBeenCalled()
    expect(transactionsStore.push).not.toHaveBeenCalled()
    expect(transactionsStore.remove).not.toHaveBeenCalled()
  })

  it.each(["Status code: 429", "Status code: 503", "Network request failed"])(
    "propagates %s without fetching full history or changing storage, then recovers on the next poll",
    async (message) => {
      const error = new Error(message)
      latest.mockRejectedValueOnce(error)

      await expect(transactionTracker.loadHistory([account])).rejects.toBe(
        error,
      )
      expect(fullHistory).not.toHaveBeenCalled()
      expect(details).not.toHaveBeenCalled()
      expect(transactionsStore.push).not.toHaveBeenCalled()
      expect(transactionsStore.remove).not.toHaveBeenCalled()

      await transactionTracker.loadHistory([account])
      expect(latest).toHaveBeenCalledTimes(2)
      expect(transactionsStore.push).toHaveBeenCalledWith([stored])
    },
  )

  it("deduplicates accounts before polling", async () => {
    await transactionTracker.loadHistory([account, { ...account }])
    expect(latest).toHaveBeenCalledOnce()
    expect(fullHistory).not.toHaveBeenCalled()
  })

  it("refreshes details for a tracked pending transaction when it becomes confirmed", async () => {
    vi.mocked(transactionsStore.get).mockResolvedValue([
      { ...stored, status: "ACCEPTED_ON_MEMPOOL" },
    ])

    await transactionTracker.loadHistory([account])

    expect(details).toHaveBeenCalledWith(overview.hash)
    expect(mapAlephiumTransactionToTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ hash: overview.hash }),
      account,
      stored.meta,
    )
    expect(transactionsStore.remove).toHaveBeenCalledOnce()
    expect(transactionsStore.push).toHaveBeenCalledWith([stored])
    expect(fullHistory).not.toHaveBeenCalled()
  })
})
