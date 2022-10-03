import { Transaction } from '@alephium/sdk/api/explorer'
import { useEffect, useRef, useState } from 'react'

import { Address } from '../../../shared/addresses'
import { getAlephiumTransactions } from '../../services/backgroundTransactions'
import { useAddresses } from '../addresses/addresses.state'

const getAddressTransactions = async (address: Address) => {
  let transactions: Transaction[] = []

  try {
    const txs = await getAlephiumTransactions(address.hash)
    transactions = txs
    return transactions
  } catch (e) {
    console.error(e)
  }
}

export const useAddressTransactions = (address: Address) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const getTransactions = async () => {
      const txs = await getAddressTransactions(address)
      txs && setTransactions(txs)
    }
    getTransactions()
  }, [address, setTransactions])

  return transactions
}

export const useAllTransactions = () => {
  const { addresses } = useAddresses()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const lastFetchTime = useRef<Date | undefined>(undefined)

  useEffect(() => {
    const getAllTransactions = async () => {
      for await (const address of addresses) {
        const txs = await getAddressTransactions(address)

        txs &&
          setTransactions((prev) => {
            const existingTxHashes = prev.reduce<string[]>((acc, t) => [...acc, t.hash], [])

            return [...prev, ...txs.filter((t) => !existingTxHashes.includes(t.hash))]
          })
      }
    }

    if (!lastFetchTime.current || lastFetchTime.current.getTime() - Date.now() > 10000) {
      setTransactions([])
      getAllTransactions()
      lastFetchTime.current = new Date()
    }
  }, [addresses])

  return transactions
}
