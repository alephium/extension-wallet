import { FC, useEffect, useState } from "react"
import Select from 'react-select';
import { AlephiumWindowObject, getDefaultAlephiumWallet } from '@alephium/get-extension-wallet'
import {
  destroyTokenContract,
  getAlphBalance,
  getTokenBalances,
  mintToken,
  TokenBalance,
  transferToken,
  withdrawMintedToken
} from "../services/token.service"
import {
  addToken,
  getExplorerBaseUrl,
  signMessage,
  signUnsignedTx,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"
import { SubscribeOptions, subscribeToTxStatus, TxStatusSubscription, TxStatus, web3, MessageHasher, prettifyAttoAlphAmount, isHexString } from "@alephium/web3"

type Status = "idle" | "approve" | "pending" | "success" | "failure"

export const TokenDapp: FC<{
  address: string
}> = ({ address }) => {
  const [mintAmount, setMintAmount] = useState("10")
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [shortText, setShortText] = useState("")
  const [messageHasher, setMessageHasher] = useState<MessageHasher>("alephium")
  const [unsignedTx, setUnsignedTx] = useState("")
  const [txSignature, setTxSignature] = useState("")
  const [lastSig, setLastSig] = useState<string>()
  const [lastTransactionHash, setLastTransactionHash] = useState("")
  const [transactionStatus, setTransactionStatus] = useState<Status>("idle")
  const [transactionError, setTransactionError] = useState("")
  const [addTokenError, setAddTokenError] = useState("")
  const [transferTokenAddress, setTransferTokenAddress] = useState("")
  const [destroyTokenAddress, setDestroyTokenAddress] = useState("")
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [alphBalance, setAlphBalance] = useState<{ balance: string, lockedBalance: string } | undefined>()
  const [mintedToken, setMintedToken] = useState<string | undefined>()
  const [transferingMintedToken, setTransferingMintedToken] = useState<boolean>(false)
  const [selectedTokenBalance, setSelectedTokenBalance] = useState<{ value: TokenBalance, label: string } | undefined>()
  const [alephium, setAlephium] = useState<AlephiumWindowObject | undefined>(undefined)

  const buttonsDisabled = ["approve", "pending"].includes(transactionStatus)

  const resetMintToken = () => {
    setMintedToken(undefined)
    setMintAmount("10")
    setTransferingMintedToken(false)
  }

  useEffect(() => {
    getTokenBalances(address).then(tokenBalances => {
      if (tokenBalances.length > 0) {
        setSelectedTokenBalance({ value: tokenBalances[0], label: tokenBalances[0].id })
      }
      setTokenBalances(tokenBalances)
    })

    getAlphBalance(address).then(alphBalance => {
      setAlphBalance(alphBalance)
    })

    getDefaultAlephiumWallet().then(alephium => {
      if (!!alephium) {
        setAlephium(alephium)
      }
    })
  }, [address])

  useEffect(() => {
    ; (async () => {
      if (lastTransactionHash && transactionStatus === "pending") {
        setTransactionError("")

        if (alephium?.nodeProvider) {
          let subscription: TxStatusSubscription | undefined = undefined
          let txNotFoundRetryNums = 0
          web3.setCurrentNodeProvider(alephium.nodeProvider)

          const subscriptionOptions: SubscribeOptions<TxStatus> = {
            pollingInterval: 3000,
            messageCallback: async (status: TxStatus): Promise<void> => {
              switch (status.type) {
                case "Confirmed": {
                  console.log(`Transaction ${lastTransactionHash} is confirmed`)
                  setTransactionStatus("success")

                  if (transferingMintedToken) {
                    console.log("reset mint token")
                    resetMintToken()
                  }

                  subscription?.unsubscribe()
                  break
                }

                case "TxNotFound": {
                  console.log(`Transaction ${lastTransactionHash} is not found`)
                  if (txNotFoundRetryNums > 3) {
                    setTransactionStatus("failure")
                    setTransactionError(`Transaction ${lastTransactionHash} not found`)
                    subscription?.unsubscribe()
                  } else {
                    await new Promise(r => setTimeout(r, 3000));
                  }

                  txNotFoundRetryNums += 1
                  break
                }

                case "MemPooled": {
                  console.log(`Transaction ${lastTransactionHash} is in mempool`)
                  setTransactionStatus("pending")
                  break
                }
              }
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

          subscription = subscribeToTxStatus(subscriptionOptions, lastTransactionHash)
        } else {
          throw Error("Alephium object is not initialized")
        }
      }
    })()
  }, [transactionStatus, lastTransactionHash, alephium?.nodeProvider, transferingMintedToken])

  const network = 'devnet'

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setTransactionStatus("approve")

      console.log("mint", mintAmount)
      const result = await mintToken(mintAmount, network)
      console.log(result)

      setMintedToken(result.contractInstance.address)
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
      const result = await transferToken(transferTokenAddress, transferTo, transferAmount, network)
      console.log(result)

      setLastTransactionHash(result.txId)
      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleDestroyTokenSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setTransactionStatus("approve")

      const destroyTokenContractResult = await destroyTokenContract(destroyTokenAddress)
      setLastTransactionHash(destroyTokenContractResult.txId)

      setTransactionStatus("pending")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleWithdrawMintedTokenSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      if (mintedToken) {
        setTransactionStatus("approve")
        console.log("transfer", { transferTo, transferAmount, mintedToken })

        const result = await withdrawMintedToken(mintAmount, mintedToken)

        setLastTransactionHash(result.txId)
        setTransactionStatus("pending")
        setTransferingMintedToken(true)
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

      console.log("sign", shortText, messageHasher)
      const result = await signMessage(shortText, messageHasher)
      console.log(result)

      setLastSig(result.signature)
      setTransactionStatus("success")
    } catch (e) {
      console.error(e)
      setTransactionStatus("idle")
    }
  }

  const handleSignUnsignedTxSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setTransactionStatus("approve")

      console.log("sign unsigned tx", unsignedTx)
      const result = await signUnsignedTx(unsignedTx)
      console.log(result)

      setTxSignature(result.signature)
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
            href={`${getExplorerBaseUrl()}/transactions/${lastTransactionHash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "blue", margin: "0 0 1em" }}
          >
            <code>{lastTransactionHash}</code>
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

      <h3 style={{ margin: 0 }}>
        ALPH Balance: <code>{alphBalance?.balance && prettifyAttoAlphAmount(alphBalance.balance)} ALPH</code>
      </h3>
      <h3 style={{ margin: 0 }}>
        {
          tokenBalances.length > 0 ? (
            <>
              <label>Token Balances ({tokenBalances.length} tokens in total)</label>
              <div className="columns">
                <Select
                  value={selectedTokenBalance}
                  onChange={
                    (selected) => {
                      selected && setSelectedTokenBalance(selected)
                    }
                  }
                  options={
                    tokenBalances.map((tokenBalance) => {
                      return { value: tokenBalance, label: tokenBalance.id }
                    })
                  }
                />
                <code>{selectedTokenBalance?.value.balance.balance.toString()}</code>
                <code>
                  <button
                    className="flat"
                    style={{ marginLeft: ".6em" }}
                    onClick={async () => {
                      try {
                        if (selectedTokenBalance?.value.id) {
                          const result = await addToken(selectedTokenBalance?.value.id)
                          if (result) {
                            setAddTokenError("")
                          } else {
                            setAddTokenError("Token exists")
                          }
                        }
                      } catch (error: any) {
                        setAddTokenError(error.message)
                      }
                    }}
                  >
                    Add to wallet
                  </button>
                </code>
              </div>
              <span className="error-message">{addTokenError}</span>
            </>
          ) : <div>No tokens</div>
        }

      </h3>

      <div className="columns">
        {
          (mintedToken && alephium?.connectedAccount) ? (
            <form onSubmit={handleWithdrawMintedTokenSubmit}>
              <h2 className={styles.title}>Withdraw all minted token</h2>
              <label htmlFor="token-address">Token Address</label>
              <p>{mintedToken}</p>

              <label htmlFor="transfer-to">To</label>
              <input
                type="text"
                id="transfer-to"
                name="fname"
                disabled
                value={alephium.connectedAccount.address}
                onChange={(e) => setTransferTo(e.target.value)}
              />

              <label htmlFor="transfer-amount">Amount</label>
              <input
                type="number"
                id="transfer-amount"
                name="fname"
                disabled
                value={mintAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <br />
              <input type="submit" disabled={buttonsDisabled} value="Withdraw" />
            </form>

          ) : (
            <form onSubmit={handleMintSubmit}>
              <h2 className={styles.title}>Mint token</h2>

              <label htmlFor="mint-amount">Amount</label>
              <input
                type="number"
                id="mint-amount"
                name="fname"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
              />

              <input type="submit" />
            </form>
          )
        }
        <form onSubmit={handleTransferSubmit}>
          <h2 className={styles.title}>Transfer token</h2>

          <label htmlFor="transfer-token-address">Token Id</label>
          <input
            type="text"
            id="transfer-to"
            name="fname"
            value={transferTokenAddress}
            onChange={(e) => setTransferTokenAddress(e.target.value)}
          />

          <label htmlFor="transfer-to">To</label>
          <input
            type="text"
            id="transfer-to"
            name="fname"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />

          <label htmlFor="transfer-amount">Amount</label>
          <input
            type="number"
            id="transfer-amount"
            name="fname"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <br />
          <input type="submit" disabled={buttonsDisabled} value="Transfer" />
        </form>
        <form onSubmit={handleDestroyTokenSubmit}>
          <h2 className={styles.title}>Destroy token contract</h2>

          <label htmlFor="destroy-token-address">Token Id</label>
          <input
            type="text"
            id="destroy-token-address"
            name="fname"
            value={destroyTokenAddress}
            onChange={(e) => setDestroyTokenAddress(e.target.value)}
          />
          <input type="submit" disabled={buttonsDisabled} value="Destroy" />
        </form>
      </div>
      <div className="columns">
        <form onSubmit={handleSignSubmit}>
          <h2 className={styles.title}>Sign Message</h2>

          <div className="columns">
            <label htmlFor="short-text">Short Text</label>
            <textarea
              id="short-text"
              name="short-text"
              value={shortText}
              onChange={(e) => setShortText(e.target.value)}
            />
          </div>

          <div className="columns">
            <label htmlFor="short-text">Hasher</label>
            <select name="hasher" id="hasher" onChange={(e) => setMessageHasher(e.target.value as MessageHasher)}>
              <option value="alephium">Alephium</option>
              <option value="sha256">Sha256</option>
              <option value="blake2b">blake2b</option>
            </select>
          </div>

          <input type="submit" value="Sign" />
        </form>
        <form>
          <h2 className={styles.title}>Sign results</h2>

          {/* Label and textarea for value r */}
          <label htmlFor="r">Signature</label>
          <textarea
            className={styles.textarea}
            id="signature"
            name="signature"
            value={lastSig}
            readOnly
          />
        </form>
      </div>
      <div className="columns">
        <form onSubmit={handleSignUnsignedTxSubmit}>
          <h2 className={styles.title}>Sign Unsigned Tx</h2>

          <div className="columns">
            <label htmlFor="short-text">Unsigned Tx</label>
            <input
              type="text"
              id="short-text"
              name="short-text"
              value={unsignedTx}
              onChange={(e) => setUnsignedTx(e.target.value)}
            />
          </div>

          <input type="submit" value="Sign" />
        </form>
        <form>
          <h2 className={styles.title}>Sign results</h2>

          {/* Label and textarea for value r */}
          <label htmlFor="r">Signature</label>
          <textarea
            className={styles.textarea}
            id="signature"
            name="signature"
            value={txSignature}
            readOnly
          />
        </form>
      </div>
    </>
  )
}
