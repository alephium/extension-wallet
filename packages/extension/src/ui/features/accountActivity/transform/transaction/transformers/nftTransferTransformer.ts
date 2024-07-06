import {
  isNftTransferCall,
  parseNftTransferCall,
} from "../../../../../../shared/call/nftTransferCall"
import { NFTTransferTransaction } from "../../type"
import { getCallsFromTransaction } from "../getCallsFromTransaction"
import { ITransactionTransformer } from "./type"
import i18n from "../../../../../../i18n"

/** adds erc721 token transfer data */

export default function ({ transaction, result }: ITransactionTransformer) {
  const calls = getCallsFromTransaction(transaction)
  for (const call of calls) {
    if (isNftTransferCall(call)) {
      const action = "TRANSFER"
      const entity = "NFT"
      const displayName = i18n.t("Transfer NFT")
      const { contractAddress, fromAddress, toAddress, tokenId } =
        parseNftTransferCall(call)
      result = {
        ...result,
        action,
        entity,
        displayName,
        fromAddress,
        toAddress,
        tokenId,
        contractAddress,
      } as NFTTransferTransaction
      return result
    }
  }
}
