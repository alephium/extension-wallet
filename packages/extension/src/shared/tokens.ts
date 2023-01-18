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

// TODO: Use official Alephium tokens-meta repo
const TOKEN_METADATA_URL = 'https://raw.githubusercontent.com/nop33/token-meta/master/tokens.json'
export const TOKEN_IMAGE_URL = 'https://raw.githubusercontent.com/nop33/token-meta/master/images/'


export const ALPH_NAME = 'Alephium'
export const ALPH_SYMBOL = 'ALPH'
export const ALPH_IMAGE = 'https://raw.githubusercontent.com/alephium/alephium-brand-guide/master/logos/light/Logo-Icon.png'

export const fetchTokensMetadata = async () => {
  const response = await fetch(TOKEN_METADATA_URL)
  return await response.json()
}