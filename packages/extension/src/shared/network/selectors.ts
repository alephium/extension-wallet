import { memoize } from "lodash-es"

import { Network } from "./type"

export const networkSelector = memoize(
  (networkId: string) => (network: Network) => network.id === networkId,
)

export const networkSelectorById = (id: string) =>
  (network: Network) => network.id === id
