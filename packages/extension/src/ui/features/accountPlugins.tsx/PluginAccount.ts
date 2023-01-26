import { Abi, Call, Contract, hash, number } from "starknet"

import ArgentPluginCompiledContractAbi from "../../../abis/ArgentPluginAccount.json"
import { executeTransaction } from "../../services/backgroundTransactions"
import { Account as ArgentXAccount } from "../accounts/Account"

export class PluginAccount extends ArgentXAccount {
  constructor(account: ArgentXAccount) {
    super({
      ...account,
      type: "argent-plugin",
    })
  }

  public static accountToPluginAccount(account?: ArgentXAccount) {
    if (!account) {
      throw new Error("Cannot convert to Plugin Account")
    }

    return new PluginAccount(account)
  }

  public async isPlugin(): Promise<boolean> {
    return true // FIXME
  }

  public addPlugin(pluginClassHash: string) {
    throw Error('Not Implemented')
  }

  public removePlugin(pluginClassHash: string) {
    throw Error('Not Implemented')
  }

  public async executeOnPlugin(
    pluginClassHash: string,
    call: Omit<Call, "contractAddress">,
  ) {
    throw Error('Not Implemented')
  }
}
