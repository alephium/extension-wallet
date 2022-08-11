import { convertSetToAlph } from "@alephium/sdk"
import { FC } from "react"

import { TransactionPayload } from "../../../../shared/transactions"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { formatTruncatedAddress } from "../../../services/addresses"
import { assertNever } from "../../../services/assertNever"
import { TransactionBanner } from "./TransactionBanner"

export interface ITransactionsList {
  payload: TransactionPayload
}

export const messageForTransactions = (payload: TransactionPayload) => {
  switch (payload.type) {
    case "ALPH_SIGN_TRANSFER_TX": {
      const destination = payload.params.destinations[0]
      const recipient = formatTruncatedAddress(destination.address)
      const amount = convertSetToAlph(BigInt(destination.attoAlphAmount))
      return `Sending ${amount} ALPH to ${recipient}`
    }

    case "ALPH_SIGN_CONTRACT_CREATION_TX": {
      return `Creating contract with bytecode ${payload.params.bytecode}`
    }

    case "ALPH_SIGN_SCRIPT_TX": {
      return `Running script with bytecode ${payload.params.bytecode}`
    }

    default:
      assertNever(payload)
  }
}

export const TransactionsList: FC<ITransactionsList> = ({ payload }) => {
  return (
    <>
      {
        <TransactionBanner
          icon={WarningIcon}
          message={messageForTransactions(payload)}
        />
      }
    </>
  )
}
