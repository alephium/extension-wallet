import { TokenMintTransaction } from "../../type"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"
import i18n from "../../../../../../i18n"

/** adds erc20 token mint data */

export default function ({
  explorerTransaction,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  if (fingerprint === "events[] calls[mint]") {
    const { calls } = explorerTransaction
    const action = "MINT"
    const entity = "TOKEN"
    const displayName = i18n.t("Mint")
    const tokenAddress = calls?.[0]?.address
    const parameters = calls?.[0].parameters
    const amount = getParameter(parameters, "tokenId")
    result = {
      ...result,
      action,
      entity,
      displayName,
      amount,
      tokenAddress,
    } as TokenMintTransaction
    return result
  }
}
