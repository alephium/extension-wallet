import { MIN_UTXO_SET_AMOUNT, convertSetToAlph } from "@alephium/sdk"
import { string } from "yup"

export const inputAmountSchema = string()
  .trim()
  .required("Amount is required")
  .test((amount, ctx) => {
    if (!amount) {
      return ctx.createError({ message: "Amount is required" })
    }

    try {
      const minAmountInAlph = convertSetToAlph(MIN_UTXO_SET_AMOUNT)
      const amountValueAsFloat = parseFloat(amount)
      if (amountValueAsFloat < parseFloat(minAmountInAlph)) {
        return ctx.createError({
          message: `Amount must be greater than ${minAmountInAlph}`,
        })
      }
    } catch {
      return ctx.createError({ message: "Amount should be a number" })
    }

    return true
  })

export const isValidInputAmount = (amount: string) =>
  inputAmountSchema.isValidSync(amount)
