import { convertSetToAlph } from "@alephium/sdk"
import { FC } from "react"

import { TransactionPayload } from "../../../../shared/transactions"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { formatTruncatedAddress } from "../../../services/addresses"
import { TransactionBanner } from "./TransactionBanner"

export interface ITransactionsList {
  payload: TransactionPayload
}

export const messageForTransactions = (payload: TransactionPayload) => {
  switch (payload.type) {
    case "ALPH_SIGN_TRANSFER_TX": {
      const sender = formatTruncatedAddress(payload.params.signerAddress)
      const destination = payload.params.destinations[0]
      const recipient = formatTruncatedAddress(destination.address)
      const amount = convertSetToAlph(BigInt(destination.attoAlphAmount))
      return `Sending ${amount} ALPH from ${sender} to ${recipient}`
    }
  }
}

export const TransactionsList: FC<ITransactionsList> = ({ payload }) => {
  return (
    <>
      {
        <TransactionBanner
          variant={"warn"}
          icon={WarningIcon}
          message={messageForTransactions(payload)}
        />
      }
    </>
  )
}
