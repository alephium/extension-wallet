# Background transaction polling

The current Alephium source already uses `/addresses/{address}/latest-transaction` for background change detection. The overview supplies the hash and timestamp needed by the tracker. An unchanged confirmed hash does not fetch inputs or outputs. A new transaction, or confirmation of a tracked pending transaction, still fetches that single transaction's details before updating the local history.

An empty-history 404 produces no update. Other failures propagate to the background task's existing error handling; the next scheduled poll can retry. The polling path does not fall back to the full address-transactions endpoint. The separate history-screen request is intentionally unchanged.

`latestTransactionPolling.test.ts` exercises the real tracker and update selection with mocked explorer, network and storage boundaries. It covers new and unchanged transactions, empty history, rate limiting, server/network failures and recovery, duplicate accounts, and pending-to-confirmed metadata. No keys, live accounts or network access are needed.

Run from the repository root:

```sh
yarn workspace @alephium/extension test test/latestTransactionPolling.test.ts
```

The regression coverage targets current Alephium `master`. The contribution guide's `develop` instruction is inherited from Argent: the current `develop` tip is a January 2023 Argent snapshot without this Alephium polling path. Confirm the intended target branch before submitting this test-only change.
