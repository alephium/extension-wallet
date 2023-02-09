import {
  constants,
  getChecksumAddress,
  number,
  validateAndParseAddress,
  validateChecksumAddress,
} from "starknet"
import * as yup from "yup"

export const normalizeAddress = (address: string) => address

export const formatTruncatedAddress = (address: string) => {
  const start = address.slice(0, 6)
  const end = address.slice(-6)
  return `${start} ... ${end}`
}

export const formatFullAddress = (address: string) => {
  const normalized = normalizeAddress(address)
  const hex = normalized.slice(0, 2)
  const rest = normalized.slice(2)
  const parts = rest.match(/.{1,4}/g) || []
  return `${hex} ${parts.join(" ")}`
}

const isChecksumAddress = (address: string) => {
  if (/^0x[0-9a-f]{63,64}$/.test(address)) {
    return false
  }
  return true
}

export const addressLength = 45
export const addressSchema = yup
  .string()
  .trim()
  .required('Address is required')
  .length(addressLength)
  .test((address, ctx) => {
    if (!address) {
      return ctx.createError({ message: 'Address is required' })
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      return ctx.createError({ message: 'Invalid Address' })
    }

    return true
  })

export const isValidAddress = (address: string) =>
  addressSchema.isValidSync(address)

export const isEqualAddress = (a: string, b: string) => {
  try {
    if (a === b) {
      return true
    } else {
      return number.hexToDecimalString(a) === number.hexToDecimalString(b)
    }
  } catch {
    // ignore parsing error
  }
  return false
}
