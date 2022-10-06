import * as yup from 'yup'

export const formatTruncatedAddress = (address: string) => {
  const start = address.slice(0, 6)
  const end = address.slice(-6)
  return `${start} ... ${end}`
}

export const addressSchema = yup
  .string()
  .trim()
  .required('Address is required')
  .test((address, ctx) => {
    if (!address) {
      return ctx.createError({ message: 'Address is required' })
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      return ctx.createError({ message: 'Invalid Address' })
    }

    return true
  })

export const isValidAddress = (address: string) => addressSchema.isValidSync(address)
