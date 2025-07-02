import type { NextPage } from "next"
import Head from "next/head"
import { TokenDapp } from "../components/TokenDapp"
import styles from "../styles/Home.module.css"
import { AlephiumConnectButton, useWallet, useWalletConfig } from "@alephium/web3-react"

const Home: NextPage = () => {
  const { connectionStatus, account } = useWallet()
  const { network } = useWalletConfig()

  return (
    <div className={styles.container}>
      <Head>
        <title>Alephium Test dApp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <AlephiumConnectButton />

        {connectionStatus === 'connected' ? (
          <>
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{account.address}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              Network: <code>{network}</code>
            </h3>
            {account.address && (
              <TokenDapp address={account.address} />
            )}
          </>
        ) : (
          <p>First connect wallet to use dapp.</p>
        )}
      </main>
    </div>
  )
}

export default Home
