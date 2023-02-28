import {
  number,
} from "starknet"
import * as yup from "yup"

export const normalizeAddress = (address: string) => address

export const formatLongString = (data: string, _threshold?: number) => {
  const threshold = _threshold ?? 4
  const items = data.split(' ')
  if (items.length == 1 && data.length > threshold * 2) {
    const start = data.slice(0, threshold)
    const end = data.slice(-threshold)
    return `${start} ... ${end}`
  } else {
    return data
  }
}

export const formatTruncatedAddress = (address: string) => {
  if (address.length > 8) {
    const start = address.slice(0, 4)
    const end = address.slice(-4)
    return `${start} ... ${end}`
  } else {
    return address
  }
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

// TODO: improve address validation
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
