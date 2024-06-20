import { isEqualAddress } from "../../../../../services/addresses"
import { TokenTransferTransaction } from "../../type"
import { getParameter } from "../getParameter"
import { IExplorerTransactionTransformer } from "./type"
import i18n from "../../../../../../i18n"

/** adds erc20 token transfer data */

export default function({
  explorerTransaction,
  accountAddress,
  result,
  fingerprint,
}: IExplorerTransactionTransformer) {
  /** Some transfers have no events */
  if (
    fingerprint === "events[Transfer] calls[transfer]" ||
    fingerprint === "events[] calls[transfer]"
  ) {
    const { calls, events } = explorerTransaction
    if (calls?.length === 1) {
      const entity = "TOKEN"
      let action = "TRANSFER"
      let displayName = i18n.t("Transfer")
      const tokenAddress = calls[0].address
      const parameters = calls[0].parameters
      const eventParameters = events?.[0]?.parameters
      const fromAddress =
        explorerTransaction.contractAddress ||
        getParameter(eventParameters, "from_")
      const toAddress = getParameter(parameters, "recipient")
      const amount = getParameter(parameters, "amount")
      if (accountAddress && toAddress && fromAddress) {
        if (isEqualAddress(toAddress, accountAddress)) {
          action = "RECEIVE"
          displayName = i18n.t("Receive")
        }
        if (isEqualAddress(fromAddress, accountAddress)) {
          action = "SEND"
          displayName = i18n.t("Send")
        }
      }
      result = {
        ...result,
        action,
        entity,
        displayName,
        fromAddress,
        toAddress,
        amount,
        tokenAddress,
      } as TokenTransferTransaction
      return result
    }
  }
}
