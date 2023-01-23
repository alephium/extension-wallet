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
    return executeTransaction({
      transactions: {
        contractAddress: this.address,
        entrypoint: "addPlugin",
        calldata: [number.hexToDecimalString(pluginClassHash)],
      },
    })
  }

  public removePlugin(pluginClassHash: string) {
    return executeTransaction({
      transactions: {
        contractAddress: this.address,
        entrypoint: "removePlugin",
        calldata: [number.hexToDecimalString(pluginClassHash)],
      },
    })
  }

  public async executeOnPlugin(
    pluginClassHash: string,
    call: Omit<Call, "contractAddress">,
  ) {
    return executeTransaction({
      transactions: {
        contractAddress: this.address,
        entrypoint: "executeOnPlugin",
        calldata: [
          pluginClassHash,
          hash.getSelectorFromName(call.entrypoint),
          call.calldata?.length ?? 0,
          ...number.bigNumberishArrayToDecimalStringArray(call.calldata ?? []),
        ],
      },
    })
  }
}
