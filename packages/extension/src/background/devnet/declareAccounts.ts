import { memoize } from "lodash-es"
import { Account, AccountInterface, ec } from "starknet"
import urlJoin from "url-join"

import { Network, getProvider } from "../../shared/network"
import { LoadContracts } from "../accounts"
import {
  ARGENT_ACCOUNT_CONTRACT_CLASS_HASHES,
  PROXY_CONTRACT_CLASS_HASHES,
} from "../wallet"

interface PreDeployedAccount {
  address: string
  private_key: string
}

export const getPreDeployedAccount = async (
  network: Network,
  index = 0,
): Promise<AccountInterface | null> => {
  try {
    const preDeployedAccounts = await fetch(
      urlJoin(network.nodeUrl, "predeployed_accounts"),
    ).then((x) => x.json() as Promise<PreDeployedAccount[]>)

    const preDeployedAccount = preDeployedAccounts[index]
    if (!preDeployedAccount) {
      throw new Error(`No pre-deployed account with index ${index}`)
    }

    const provider = getProvider(network)
    const keypair = ec.getKeyPair(preDeployedAccount.private_key)
    return new Account(provider, preDeployedAccount.address, keypair)
  } catch (e) {
    console.warn(`Failed to get pre-deployed account: ${e}`)
    return null
  }
}
