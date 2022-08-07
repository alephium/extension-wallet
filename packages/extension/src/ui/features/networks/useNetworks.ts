import useSWR from "swr"

import { getNetwork } from "../../../shared/networks"
import { getNetworks } from "../../services/backgroundNetworks"
import { SWRConfigCommon } from "../../services/swr"

export const useNetworks = (config?: SWRConfigCommon) => {
  const { data: allNetworks = [], ...rest } = useSWR(
    ["customNetworks"],
    getNetworks,
    config,
  )

  return {
    allNetworks,
    ...rest,
  }
}

export const useNetwork = (networkId: string, config?: SWRConfigCommon) => {
  const { allNetworks, ...rest } = useNetworks(config)

  return {
    network: getNetwork(networkId, allNetworks),
    ...rest,
  }
}
