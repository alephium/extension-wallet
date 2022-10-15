import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'

import { connectWallet, silentConnectWallet } from '../services/wallet.service'
import styles from '../styles/Home.module.css'

import { getToken } from '../get_token'

const Home: NextPage = () => {
  const [_address, setAddress] = useState<string>()
  const [_isConnected, setConnected] = useState(false)

  useEffect(() => {
    ;(async () => {
      const wallet = await silentConnectWallet()
      setAddress(wallet?.defaultAddress?.address)
      setConnected(!!wallet?.isConnected)
    })()
  }, [])

  const getTokenClick = async () => {
    const wallet = await connectWallet()
    if (wallet === undefined) {
      throw Error('Please connect wallet first')
    }
    setAddress(wallet.defaultAddress?.address)
    setConnected(!!wallet.isConnected)
    const result = await getToken(wallet)
    console.log('get token transaction id: ' + result.txId)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Alephium test dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <>
          <button className={styles.connect} onClick={getTokenClick}>
            Get Token
          </button>
        </>
      </main>
    </div>
  )
}

export default Home
