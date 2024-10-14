import { ExplorerProvider, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { WalletAccount } from './wallet.model'

const minGap = 5
const derivationBatchSize = 10

export abstract class AccountDiscovery {
  abstract nextPathIndexForDiscovery(indexes: number[]): number

  public async deriveActiveAccountsForNetwork(
    explorerProvider: ExplorerProvider,
    deriveAccount: (startIndex: number, group?: number) => Promise<WalletAccount>
  ): Promise<WalletAccount[]> {
    const walletAccounts: WalletAccount[] = []
    for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
      const walletAccountsForGroup = await this.deriveActiveAccountsForGroup(
        explorerProvider,
        [],
        [],
        (startIndex: number) => deriveAccount(startIndex, group)
      )
      walletAccounts.push(...walletAccountsForGroup)
    }

    return walletAccounts
  }

  private async deriveActiveAccountsForGroup(
    explorerProvider: ExplorerProvider,
    allWalletAccounts: { wallet: WalletAccount, active: boolean }[],
    activeWalletAccounts: WalletAccount[],
    deriveAccount: (startIndex: number) => Promise<WalletAccount>
  ): Promise<WalletAccount[]> {
    const gapSatisfied = (allWalletAccounts.length >= minGap) && allWalletAccounts.slice(-minGap).every(item => !item.active);
    if (gapSatisfied) {
      return activeWalletAccounts
    } else {
      let startIndex = this.nextPathIndexForDiscovery(allWalletAccounts.map(account => account.wallet.signer.derivationIndex))
      const newWalletAccounts = []
      for (let i = 0; i < derivationBatchSize; i++) {
        const newWalletAccount = await deriveAccount(startIndex)
        newWalletAccounts.push(newWalletAccount)
        startIndex = newWalletAccount.signer.derivationIndex + 1
      }

      const results = await explorerProvider.addresses.postAddressesUsed(newWalletAccounts.map(account => account.address))

      const updatedActiveWalletAccounts = activeWalletAccounts
      for (let i = 0; i < derivationBatchSize; i++) {
        const newWalletAccount = newWalletAccounts[i]
        const result = results[i]
        if (result) {
          updatedActiveWalletAccounts.push(newWalletAccount)
        }
        allWalletAccounts.push({ wallet: newWalletAccount, active: result })
      }

      return this.deriveActiveAccountsForGroup(
        explorerProvider,
        allWalletAccounts,
        updatedActiveWalletAccounts,
        deriveAccount
      )
    }
  }
}