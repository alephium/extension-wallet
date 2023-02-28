import type { NextPage } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"
import { TokenDapp } from "../components/TokenDapp"
import {
  connectWallet,
  disconnectWallet,
  silentConnectWallet
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
  const [address, setAddress] = useState<string>()
  const [network, setNetwork] = useState<string | undefined>(undefined)
  const [isConnected, setConnected] = useState(false)

  useEffect(() => {
    const handler = async () => {
      if (!isConnected) {
        silentConnectWallet(
          () => {
            return Promise.resolve(setConnected(false))
          }
        ).then(wallet => {
          setAddress(wallet?.address)
          setNetwork('devnet')
          setConnected(!!wallet)
        })
      }
    }

    ; (async () => {
      await handler()
    })()
  }, [isConnected])

  const handleConnectClick = async () => {
    const wallet = await connectWallet(
      () => {
        return Promise.resolve(setConnected(false))
      }
    )
    setAddress(wallet?.address)
    setNetwork('devnet')
    setConnected(!!wallet)
  }

  const handleDisconnectClick = async () => {
    await disconnectWallet()
    setAddress(undefined)
    setNetwork(undefined)
    setConnected(false)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Alephium Test dApp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isConnected ? (
          <>
            <button className={styles.connect} onClick={handleDisconnectClick}>
              Disconnect
            </button>
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{address}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              Network: <code>{network}</code>
            </h3>
            {address && (
              <TokenDapp address={address} />
            )}
          </>
        ) : (
          <>
            <button className={styles.connect} onClick={handleConnectClick}>
              Connect Wallet
            </button>
            <p>First connect wallet to use dapp.</p>
          </>
        )}
      </main>
    </div>
  )
}

export default Home
