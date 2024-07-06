import { getTokenForContractAddress } from "../../getTokenForContractAddress"
import { isSwapTransaction } from "../../is"
import { IExplorerTransactionTransformer } from "./type"
import i18n from "../../../../../../i18n"

/** adds token swap tokens */

export default function ({
  tokensByNetwork,
  result,
}: IExplorerTransactionTransformer) {
  if (isSwapTransaction(result)) {
    const fromToken = getTokenForContractAddress(
      result.fromTokenAddress,
      tokensByNetwork,
    )
    const toToken = getTokenForContractAddress(
      result.toTokenAddress,
      tokensByNetwork,
    )
    result.displayName = i18n.t("Sold {{ token1 }} for {{ token2 }}", { token1: fromToken?.symbol || i18n.t("unknown"), token2: toToken?.symbol || i18n.t("unknown") })
    if (fromToken) {
      result.fromToken = fromToken
    }
    if (toToken) {
      result.toToken = toToken
    }
    return result
  }
}
