import { Transaction } from '@alephium/sdk/api/explorer'
import { useEffect, useState } from 'react'

import { Address } from '../../../shared/addresses'
import { getAlephiumTransactions } from '../../services/backgroundTransactions'

export const useAddressTransactions = (address: Address) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const txs = await getAlephiumTransactions(address.hash)
        setTransactions(txs)
      } catch (e) {
        console.error(e)
      }
    }
    getTransactions()
  }, [address, setTransactions])

  return transactions
}

// export const useAllTransactions = async () => {}
