import { MIN_UTXO_SET_AMOUNT, convertSetToAlph } from '@alephium/sdk'
import { string } from 'yup'

export const alphInputAmountSchema = string()
  .trim()
  .required('ALPH Amount is required')
  .test((amount, ctx) => {
    if (!amount) {
      return ctx.createError({ message: 'Amount is required' })
    }

    try {
      const minAmountInAlph = convertSetToAlph(MIN_UTXO_SET_AMOUNT)
      const amountValueAsFloat = parseFloat(amount)
      if (amountValueAsFloat < parseFloat(minAmountInAlph)) {
        return ctx.createError({
          message: `Amount must be greater than ${minAmountInAlph}`
        })
      }
    } catch {
      return ctx.createError({ message: 'Amount should be a number' })
    }

    return true
  })

export const tokenInputAmountSchema = string()
  .trim()
  .test((amount, ctx) => {
    try {
      if (!!amount && !Number.isInteger(+amount)) {
        return ctx.createError({
          message: `Token amount must be integer`
        })
      }
    } catch {
      return ctx.createError({ message: 'Amount should be a number' })
    }

    return true
  })
