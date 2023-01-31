import { SessionAccount, createSession } from "@argent/x-sessions"
import { FC, useEffect, useState } from "react"
import { Abi, AccountInterface, Contract, ec } from "starknet"
import { hash } from "starknet5"
import { getAlephium } from '@alephium/get-extension-wallet'
import shinyToken from '../../artifacts/shiny-token.ral.json'

import Erc20Abi from "../../abi/ERC20.json"
import { truncateAddress, truncateHex } from "../services/address.service"
import {
  getErc20TokenAddress,
  getTokens,
  mintToken,
  parseInputAmountToUint256,
  transfer,
  transferMintedToken
} from "../services/token.service"
import {
  //  addToken,
  //  declare,
  getExplorerBaseUrl,
  networkId,
  signMessage,
  //  waitForTransaction,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"
import { SubscribeOptions, subscribeToTxStatus, TxStatusSubscription, TxStatus, web3 } from "@alephium/web3"

const { genKeyPair, getStarkKey } = ec

type Status = "idle" | "approve" | "pending" | "success" | "failure"

const readFileAsString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        return resolve(reader.result?.toString())
      }
      return reject(new Error("Could not read file"))
    }
    reader.onerror = reject
    reader.onabort = reject.bind(null, new Error("User aborted"))
    reader.readAsText(file)
  })
}

export const TokenDapp: FC<{
  address: string
}> = ({ address }) => {
  const [mintAmount, setMintAmount] = useState("10")
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("1")
  const [shortText, setShortText] = useState("")
  const [lastSig, setLastSig] = useState<string[]>([])
  const [lastTransactionHash, setLastTransactionHash] = useState("")
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle")
  const [transactionError, setTransactionError] = useState("")
  const [addTokenError, setAddTokenError] = useState("")
  const [classHash, setClassHash] = useState("")
  const [contract, setContract] = useState<string | undefined>()
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([])
  const [mintedToken, setMintedToken] = useState<string | undefined>()

  const alephium = getAlephium()

  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus)

  useEffect(() => {
    getTokens(address).then(tokenAddresses =>
      setTokenAddresses(tokenAddresses)
    )
  }, [address])

  useEffect(() => {
    ; (async () => {
      if (lastTransactionHash && transactionStatus === "pending") {
        setTransactionError("")

        if (alephium?.nodeProvider) {
          web3.setCurrentNodeProvider(alephium.nodeProvider)
          const subscriptionOptions: SubscribeOptions<TxStatus> = {
            pollingInterval: 3000,
            messageCallback: async (status: TxStatus): Promise<void> => {
              if (status.type === 'Confirmed' || status.type === 'TxNotFound') {
                await new Promise(r => setTimeout(r, 3000));
              }
              setTransactionStatus("success")
            },
            errorCallback: (error: any, subscription): Promise<void> => {
              console.log(error)
              setTransactionStatus("failure")
              let message = error ? `${error}` : "No further details"
              if (error?.response) {
                message = JSON.stringify(error.response, null, 2)
              }
              setTransactionError(message)

              subscription.unsubscribe()
              return Promise.resolve()
            }
          }

          subscribeToTxStatus(subscriptionOptions, lastTransactionHash)
        } else {
          throw Error("Alephium object is not initialized")
        }
      }
    })()
  }, [transactionStatus, lastTransactionHash])

  const network = networkId()

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setTransactionStatus("approve")

      console.log("mint", mintAmount)
      const result = await mintToken(mintAmount, network)
      console.log(result)

      setMintedToken(result.contractAddress)
      setLastTransactionHash(result.txId)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setTransactionStatus("approve")

      console.log("transfer", { transferTo, transferAmount })
      const result = await transfer(transferTo, transferAmount, network)
      console.log(result)

      setLastTransactionHash(result.transaction_hash)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleTransferMintedTokenSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      if (mintedToken) {
        setTransactionStatus("approve")

        console.log("transfer", { transferTo, transferAmount, mintedToken })

        const result = await transferMintedToken(transferAmount, mintedToken)
        console.log(result)

        setLastTransactionHash(result.txId)
        setTransactionStatus("pending")
      } else {
        throw Error("No minted token")
      }
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleSignSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setTransactionStatus("approve")

      console.log("sign", shortText)
      const result = await signMessage(shortText)
      console.log(result)

      setLastSig(result)
      setTransactionStatus("success")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  return (
    <>
      <h3 style={{ margin: 0 }}>
        Transaction status: <code>{transactionStatus}</code>
      </h3>
      {lastTransactionHash && (
        <h3 style={{ margin: 0 }}>
          Transaction hash:{" "}
          <a
            href={`${getExplorerBaseUrl()}/tx/${lastTransactionHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "blue", margin: "0 0 1em" }}
          >
            <code>{truncateHex(lastTransactionHash)}</code>
          </a>
        </h3>
      )}
      {transactionError && (
        <h3 style={{ margin: 0 }}>
          Transaction error:{" "}
          <textarea
            style={{ width: "100%", height: 100, background: "white" }}
            value={transactionError}
            readOnly
          />
        </h3>
      )}
      <div className="columns">
        {
          (mintedToken && alephium?.connectedAddress) ? (
            <form onSubmit={handleTransferMintedTokenSubmit}>
              <h2 className={styles.title}>Transfer all minted token</h2>
              <label htmlFor="token-address">Token Address</label>
              <p>{mintedToken}</p>

              <label htmlFor="transfer-to">To</label>
              <input
                type="text"
                id="transfer-to"
                name="fname"
                disabled
                value={alephium.connectedAddress}
                onChange={(e) => setTransferTo(e.target.value)}
              />

              <label htmlFor="transfer-amount">Amount</label>
              <input
                type="text"
                id="transfer-amount"
                name="fname"
                disabled
                value={mintAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <br />
              <input type="submit" disabled={buttonsDisabled} value="Transfer" />
            </form>

          ) : (
            <form onSubmit={handleMintSubmit}>
              <h2 className={styles.title}>Mint token</h2>

              <label htmlFor="mint-amount">Amount</label>
              <input
                type="text"
                id="mint-amount"
                name="fname"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
              />

              <input type="submit" />
            </form>

          )
        }
      </div>
      <div className="columns">
        <form onSubmit={handleSignSubmit}>
          <h2 className={styles.title}>Sign Message</h2>

          <label htmlFor="mint-amount">Short Text</label>
          <input
            type="text"
            id="short-text"
            name="short-text"
            value={shortText}
            onChange={(e) => setShortText(e.target.value)}
          />

          <input type="submit" value="Sign" />
        </form>
        <form>
          <h2 className={styles.title}>Sign results</h2>

          {/* Label and textarea for value r */}
          <label htmlFor="r">r</label>
          <textarea
            className={styles.textarea}
            id="r"
            name="r"
            value={lastSig[0]}
            readOnly
          />
          {/* Label and textarea for value s */}
          <label htmlFor="s">s</label>
          <textarea
            className={styles.textarea}
            id="s"
            name="s"
            value={lastSig[1]}
            readOnly
          />
        </form>
      </div>

      <h3 style={{ margin: 0 }}>
        {
          tokenAddresses.length > 0 ? tokenAddresses.map((tokenAddress, index) =>
            <div key={index}>{tokenAddress}</div>
          ) : "no token addresses"
        }
      </h3>
      <span className="error-message">{addTokenError}</span>
    </>
  )
  return (<div>Token App</div>)
}
