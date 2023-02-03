import { supportsSessions } from "@argent/x-sessions"
import type { NextPage } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"
import { AccountInterface } from "starknet"
import { AlephiumWindowObject } from '@alephium/get-extension-wallet'

import { TokenDapp } from "../components/TokenDapp"
import { truncateAddress } from "../services/address.service"
import {
  //  addWalletChangeListener,
  //  chainId,
  connectWallet,
  networkId,
  //  removeWalletChangeListener,
  silentConnectWallet,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
  const [address, setAddress] = useState<string>()
  const [network, setNetwork] = useState<string | undefined>(undefined)
  const [isConnected, setConnected] = useState(false)

  useEffect(() => {
    const handler = async () => {
      const wallet = await silentConnectWallet(
        () => {
          return Promise.resolve(setConnected(false))
        }
      )
      setAddress(wallet?.connectedAddress)
      setNetwork(wallet?.connectedNetworkId)
      setConnected(!!wallet?.connectedNetworkId)
    }

      ; (async () => {
        await handler()
        //addWalletChangeListener(handler)
      })()

    return () => {
      //removeWalletChangeListener(handler)
    }
  }, [])

  const handleConnectClick = async () => {
    const wallet = await connectWallet(
      () => {
        return Promise.resolve(setConnected(false))
      }
    )
    setAddress(wallet?.connectedAddress)
    setNetwork(wallet?.connectedNetworkId)
    setConnected(!!wallet?.connectedNetworkId)
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
