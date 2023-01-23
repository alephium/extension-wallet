import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { AlephiumWindowObject } from '@alephium/get-extension-wallet'

import { connectWallet, silentConnectWallet } from '../services/wallet.service'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [address, setAddress] = useState<string>()
  const [group, setGroup] = useState<number>()
  const [network, setNetwork] = useState<string>()
  const [isConnected, setConnected] = useState(false)

  const setWallet = (wallet?: AlephiumWindowObject) => {
    setNetwork(wallet?.currentNetwork)
    setAddress(wallet?.defaultAddress?.address)
    setGroup(wallet?.defaultAddress?.group)
    setConnected(!!wallet?.isConnected)
  }

  useEffect(() => {
    ;(async () => {
      const wallet = await silentConnectWallet()
      setWallet(wallet)
    })()
  }, [])

  const handleConnectClick = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    const wallet = await connectWallet(
      () => {
        return Promise.resolve(setConnected(false))
      },
      group
    )
    setWallet(wallet)
  }

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    setGroup(+event.currentTarget.value);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Alephium test dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isConnected ? (
          <>
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{address}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              Group: <code>{group}</code>
            </h3>
            {
              !!network && (
                <h3 style={{ margin: 0 }}>
                  Network: <code>{network}</code>
                </h3>
              )
            }
          </>
        ) : (
          <>
            <form onSubmit={handleConnectClick}>
              <label>
                Group:
                <input type="number" value={group || 0} min={0} max={3} onChange={handleChange} />
              </label>
              <input type="submit" value="submit" />
            </form>
          </>
        )}
      </main>
    </div>
  )
}

export default Home
