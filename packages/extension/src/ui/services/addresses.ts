import * as web3 from "@alephium/web3"
import * as yup from "yup"

export const normalizeAddress = (address: string) => address

export const formatLongString = (data: string, _threshold?: number) => {
  const threshold = _threshold ?? 4
  const items = data.split(' ')
  if (items.length == 1 && data.length > threshold * 2) {
    const start = data.slice(0, threshold)
    const end = data.slice(-threshold)
    return `${start}...${end}`
  } else {
    return data
  }
}

export const formatTruncatedAddress = (address: string, _threshold?: number) => {
  const threshold = _threshold ?? 4
  if (address.length > threshold * 2) {
    const start = address.slice(0, threshold)
    const end = address.slice(-threshold)
    return `${start}...${end}`
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

export const addressSchema = yup
  .string()
  .trim()
  .required('Address is required')
  .test((address, ctx) => {
    if (!address) {
      return ctx.createError({ message: 'Address is required' })
    }

    if (!web3.isValidAddress(address)) {
      return ctx.createError({ message: 'Invalid Address' })
    }

    return true
  })

export const isValidAddress = (address: string) =>
  addressSchema.isValidSync(address)

export const isEqualAddress = (a: string, b: string) => {
  return a === b
}
