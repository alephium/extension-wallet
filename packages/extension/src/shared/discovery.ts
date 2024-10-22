import { ExplorerProvider, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { WalletAccount } from './wallet.model'

const minGap = 5
const derivationBatchSize = 10

class DerivedAccountsPerGroup {
  accounts: WalletAccount[]
  gap: number

  constructor() {
    this.accounts = []
    this.gap = 0
  }

  addAccount(account: WalletAccount, active: boolean) {
    if (!this.isComplete()) {
      if (!active) {
        this.gap += 1
      } else {
        this.gap = 0
        this.accounts.push(account)
      }
    }
  }

  isComplete(): boolean {
    return this.gap >= minGap
  }
}

export abstract class AccountDiscovery {
  public async deriveActiveAccountsForNetwork(
    explorerProvider: ExplorerProvider,
    deriveAccount: (startIndex: number) => Promise<WalletAccount>
  ): Promise<WalletAccount[]> {
    const allAccounts = Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map(() => new DerivedAccountsPerGroup())
    let startIndex = 0
    while (allAccounts.some((a) => !a.isComplete())) {
      const newWalletAccounts = []
      for (let i = 0; i < derivationBatchSize; i++) {
        const newWalletAccount = await deriveAccount(startIndex + i)
        newWalletAccounts.push(newWalletAccount)
      }
      startIndex += derivationBatchSize
      const results = await explorerProvider.addresses.postAddressesUsed(newWalletAccounts.map(account => account.address))
      newWalletAccounts.forEach((account, index) => {
        const accountsPerGroup = allAccounts[account.signer.group]
        accountsPerGroup.addAccount(account, results[index])
      })
    }
    return allAccounts.flatMap((a) => a.accounts)
  }
}