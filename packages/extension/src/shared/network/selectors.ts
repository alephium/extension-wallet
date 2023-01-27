import { memoize } from "lodash-es"

import { Network } from "./type"

export const networkSelector = memoize(
  (networkId: string) => (network: Network) => network.id === networkId,
)

export const networkSelectorByChainId =
  (chainId: number) => (network: Network) =>
    network.chainId === chainId
