import { flatten, groupBy, toPairs } from "lodash-es"
import { Call, number } from "starknet"

import { isEqualAddress } from "../../../ui/services/addresses"
import { getNetwork, getProvider } from "../../network"
import { ArgentAccountType, WalletAccount } from "../../wallet.model"

export async function getAccountTypesFromChain(accounts: WalletAccount[]) {
  const accountsByNetwork = toPairs(groupBy(accounts, (a) => a.networkId))

  const accountTypeCallsByNetwork = accountsByNetwork.map(
    ([network, as]) =>
      [
        network,
        as.map((account): Call => {
          return {
            contractAddress: account.address,
            entrypoint: "get_implementation",
          }
        }),
      ] as const,
  )

  const newAccountTypes = flatten(
    await Promise.all(
      accountTypeCallsByNetwork.map(
        async ([networkId, calls]): Promise<
          Array<{
            address: string
            type: ArgentAccountType
          }>
        > => {
          const network = await getNetwork(networkId)

          /** fallback to single calls */
          const provider = getProvider(network)
          const responses = await Promise.all(
            calls.map((call) => provider.callContract(call)),
          )
          const results: string[] = responses.map((res) =>
            number.toHex(number.toBN(res.result[0])),
          )
          return calls.map((call, i) => ({
            address: call.contractAddress,
            type: isEqualAddress(results[i], "0x0")
              ? "argent-plugin"
              : "argent",
          }))
        },
      ),
    ),
  )

  return accounts.map((account) => {
    const accountType = newAccountTypes.find((x) =>
      isEqualAddress(x.address, account.address),
    )?.type
    return {
      ...account,
      type: accountType || account.type || "argent",
    }
  })
}
