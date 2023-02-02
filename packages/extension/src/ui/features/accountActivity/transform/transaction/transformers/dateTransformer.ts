import { formatDateTime } from "../../../../../services/dates"
import { ITransactionTransformer } from "./type"

/** date from timestamp */

export default function({ transaction, result }: ITransactionTransformer) {
  const { timestamp } = transaction
  if (timestamp) {
    result = {
      ...result,
      date: formatDateTime(timestamp).toString()
    }
  }
  return result
}
