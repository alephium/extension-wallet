import * as yup from "yup"

export const normalizeAddress = (address: string) => address

export const formatTruncatedAddress = (address: string) => {
  const normalized = normalizeAddress(address)
  const start = normalized.slice(0, 6)
  const end = normalized.slice(-6)
  return `${start} ... ${end}`
}

export const formatFullAddress = (address: string) => {
  const normalized = normalizeAddress(address)
  const hex = normalized.slice(0, 2)
  const rest = normalized.slice(2)
  const parts = rest.match(/.{1,4}/g) || []
  return `${hex} ${parts.join(" ")}`
}

export const addressSchema = yup
  .string()
  .trim()
  .required("Address is required")
  .test((address, ctx) => {
    if (!address) {
      return ctx.createError({ message: "Address is required" })
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      return ctx.createError({ message: "Invalid Address" })
    }

    return true
  })

export const isValidAddress = (address: string) =>
  addressSchema.isValidSync(address)
