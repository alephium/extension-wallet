import { Multicall } from "@argent/x-multicall"
import { memoize } from "lodash-es"

import { Network, getProvider } from "../network"

export class NoMulticallAddressError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "NoMulticallAddressError"
  }
}
