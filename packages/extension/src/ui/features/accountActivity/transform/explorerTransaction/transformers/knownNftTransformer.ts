import { includesAddress } from "../../../../../../shared/knownDapps"
import { isEqualAddress } from "../../../../../services/addresses"
import { NFTTransaction, NFTTransferTransaction } from "../../type"
import { IExplorerTransactionTransformer } from "./type"
import i18n from "../../../../../../i18n"

/** adds erc721 token transfer data */

export default function({
  explorerTransaction,
  accountAddress,
  result,
  nftContractAddresses,
}: IExplorerTransactionTransformer) {
  if (!nftContractAddresses) {
    return
  }
  const { events } = explorerTransaction
  for (const event of events) {
    if (
      event.name === "Transfer" &&
      includesAddress(event.address, nftContractAddresses)
    ) {
      const contractAddress = event.address
      let displayName = i18n.t("Transfer NFT")
      const entity = "NFT"
      let action = "TRANSFER"
      const fromAddress = event.parameters[0].value
      const toAddress = event.parameters[1].value
      const tokenId = event.parameters[2].value
      if (fromAddress === "0x0") {
        action = "MINT"
        displayName = i18n.t("Mint NFT")
        result = {
          ...result,
          action,
          entity,
          displayName,
          contractAddress,
          tokenId,
        } as NFTTransaction
        return result
      }
      if (accountAddress && toAddress && fromAddress) {
        if (isEqualAddress(toAddress, accountAddress)) {
          action = "RECEIVE"
          displayName = i18n.t("Receive NFT")
        }
        if (isEqualAddress(fromAddress, accountAddress)) {
          action = "SEND"
          displayName = i18n.t("Send NFT")
        }
      }
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
