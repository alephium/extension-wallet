import { Configuration } from '@alephium/cli'

const configuration: Configuration = {
  networks: {
    devnet: {
      nodeUrl: 'http://127.0.0.1:22973',
      // here we could configure which address groups to deploy the contract
      privateKeys: ['a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'],
      settings: undefined
    },

    testnet: {
      nodeUrl: process.env.NODE_URL as string,
      privateKeys: process.env.PRIVATE_KEYS === undefined ? [] : process.env.PRIVATE_KEYS.split(','),
      settings: undefined
    },

    mainnet: {
      nodeUrl: process.env.NODE_URL as string,
      privateKeys: process.env.PRIVATE_KEYS === undefined ? [] : process.env.PRIVATE_KEYS.split(','),
      settings: undefined
    }
  }
}

export default configuration
