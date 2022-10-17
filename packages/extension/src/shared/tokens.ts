export type AddressToken = {
  id: string
  balance: {
    balance: bigint
    lockedBalance: bigint
  }
}

export type TokenMetadata = {
  name: string
  description: string
  image: string
  symbol: string
  decimals: number
}
