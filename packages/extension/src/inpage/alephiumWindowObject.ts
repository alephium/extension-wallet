import { sendMessage, waitForMessage } from "./messageActions"
import { getIsPreauthorized, removePreAuthorization } from "./messaging"
import {
  Account,
  Address,
  ExplorerProvider,
  groupOfAddress,
  KeyType,
  NodeProvider,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignMessageParams,
  SignMessageResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from "@alephium/web3"
import { AlephiumWindowObject, EnableOptions } from "@alephium/get-extension-wallet"
import { TransactionParams } from "../shared/actionQueue/types"

const VERSION = `${process.env.VERSION}`

// window.ethereum like
export const alephiumWindowObject: AlephiumWindowObject = new (class extends AlephiumWindowObject {
  readonly id = 'alephium' as const
  readonly name = 'Alephium' as const
  readonly icon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgd2lkdGg9IjEwMCUiCiAgIGhlaWdodD0iMTAwJSIKICAgdmlld0JveD0iMCAwIDUxMiA1MTIiCiAgIHZlcnNpb249IjEuMSIKICAgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIKICAgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoyOyIKICAgaWQ9InN2Zzk4ODQiCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnMKICAgaWQ9ImRlZnMxMCIgLz4KICAgIDxnCiAgIGlkPSJnMTAwNyI+PHJlY3QKICAgICB4PSIwIgogICAgIHk9IjAiCiAgICAgd2lkdGg9IjUxMi4wMDA2MSIKICAgICBoZWlnaHQ9IjUxMS45OTk5MSIKICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZS13aWR0aDowLjM1NTU1NiIKICAgICBpZD0icmVjdDk4NjUiIC8+PHBhdGgKICAgICBkPSJtIDIyMi44MjMyLDMwOS43OTQxMSBjIDAsLTQuMzYxMjQgLTMuNDQ2NzgsLTcuMjk4MzIgLTcuNzA0NTgsLTYuNTQ3NjYgbCAtNTAuODkwNzksOC45NzIwOSBjIC00LjI1Nzc5LDAuNzUwNjUgLTcuNzA0NTgsNC45MDMwOCAtNy43MDQ1OCw5LjI2NDMxIHYgOTYuMjM1OTggYyAwLDQuMzcxMTkgMy40NDY3OSw3LjMwODI3IDcuNzA0NTgsNi41NTc2MSBsIDUwLjg5MDc5LC04Ljk3MjA5IGMgNC4yNTc4LC0wLjc1MDY1IDcuNzA0NTgsLTQuOTAzMDggNy43MDQ1OCwtOS4yNzQyNyB6IgogICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlLXdpZHRoOjEuMDA0NyIKICAgICBpZD0icGF0aDk4NjciIC8+PHBhdGgKICAgICBkPSJtIDM1NS4zODYyLDk0LjMwNTMwNCBjIDAsLTQuMzYxMjM3IC0zLjQ0Njc4LC03LjI5ODMxNSAtNy43MDQ1OCwtNi41NDc2NjIgbCAtNTAuODkwNzksOC45NzIwOTUgYyAtNC4yNTc3OSwwLjc1MDY1MyAtNy43MDQ1OCw0LjkwMzA3MyAtNy43MDQ1OCw5LjI2NDMxMyB2IDk2LjIzNTk3IGMgMCw0LjM3MTIgMy40NDY3OSw3LjMwODI3IDcuNzA0NTgsNi41NTc2MiBsIDUwLjg5MDc5LC04Ljk3MjA5IGMgNC4yNTc4LC0wLjc1MDY2IDcuNzA0NTgsLTQuOTAzMDggNy43MDQ1OCwtOS4yNzQyNyB6IgogICAgIHN0eWxlPSJmaWxsOiNmZjVkNTE7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlLXdpZHRoOjEuMDA0NyIKICAgICBpZD0icGF0aDk4NzEiIC8+PHBhdGgKICAgICBkPSJtIDIzMS4wODk3OSwxMTYuNzY3NDEgYyAtMS45NjU1NSwtNC4zMjkwNSAtNy4yNDkxNiwtNy4xODEyNiAtMTEuODExMDgsLTYuMzc2OTkgbCAtNTQuNTI1NzgsOS42MTI5NiBjIC00LjU2MTkyLDAuODA0MjcgLTYuNjY0MjgsNC45NTg2MyAtNC42OTg3Miw5LjI4NzY4IGwgMTIwLjczOTcxLDI2NS45MjQxMiBjIDEuOTY1NTYsNC4zMjkwNiA3LjI2MDUzLDcuMjA2MjggMTEuODIyNDQsNi40MDIwMSBsIDU0LjUyNTc5LC05LjYxMjk1IGMgNC41NjE5MiwtMC44MDQyNyA2LjY1MjkxLC00Ljk4MzY1IDQuNjg3MzYsLTkuMzEyNzEgeiIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZS13aWR0aDoxLjcxMzM0IgogICAgIGlkPSJwYXRoOTg3NSIgLz48L2c+Cjwvc3ZnPgo='
  readonly version = VERSION

  #connectedAccount: Account | undefined = undefined
  #connectedNetworkId: string | undefined = undefined
  #nodeProvider: NodeProvider | undefined = undefined
  #explorerProvider: ExplorerProvider | undefined = undefined

  get connectedAccount() {
    return this.#connectedAccount
  }
  get connectedNetworkId() {
    return this.#connectedNetworkId
  }
  get nodeProvider() {
    return this.#nodeProvider
  }
  get explorerProvider() {
    return this.#explorerProvider
  }
  onDisconnected: (() => void | Promise<void>) | undefined = undefined

  protected unsafeGetSelectedAccount(): Promise<Account> {
    if (this.connectedAccount) {
      return Promise.resolve(this.connectedAccount)
    } else {
      throw Error("No selected account")
    }
  }

  unsafeEnable = async (options: EnableOptions) => {
    return this.#unsafeEnable(options)
  }

  #unsafeEnable = async (options: EnableOptions) => {
    this.#checkTabFocused()

    const walletAccountP = Promise.race([
      waitForMessage("CONNECT_DAPP_RES", 10 * 60 * 1000),
      waitForMessage("REJECT_PREAUTHORIZATION", 10 * 60 * 1000).then(
        () => "USER_ABORTED" as const,
      ),
    ])

    sendMessage({
      type: "CONNECT_DAPP",
      data: { host: window.location.host, networkId: options.networkId, group: options.chainGroup, keyType: options.keyType },
    })

    const walletAccount = await walletAccountP

    if (!walletAccount) {
      throw Error("No wallet account (should not be possible)")
    }

    if (walletAccount === "USER_ABORTED") {
      throw Error("User aborted")
    }
    const { alephiumProviders } = window
    const alephium = alephiumProviders?.alephium
    if (!alephium) {
      throw Error("No alephium object detected")
    }

    const account = {
      address: walletAccount.address,
      publicKey: walletAccount.signer.publicKey,
      keyType: walletAccount.signer.keyType,
      group: groupOfAddress(walletAccount.address)
    }
    this.#connectedAccount = account
    this.#connectedNetworkId = walletAccount.network.id
    this.#nodeProvider = new NodeProvider(walletAccount.network.nodeUrl)
    if (walletAccount.network.explorerApiUrl) {
      this.#explorerProvider = new ExplorerProvider(walletAccount.network.explorerApiUrl)
    }
    this.onDisconnected = options.onDisconnected

    return account
  }

  isPreauthorized = async (options: EnableOptions) => {
    return getIsPreauthorized({ ...options, host: window.location.host })
  }

  signAndSubmitTransferTx = async (params: SignTransferTxParams): Promise<SignTransferTxResult> => {
    const result = (
      await this.#executeAlephiumTransaction(params, (p, host, networkId, keyType) => ({
        type: 'TRANSFER',
        params: { ...p, networkId, signerKeyType: keyType, host },
        salt: Date.now().toString()
      }))
    ).result as Omit<SignTransferTxResult, 'signature'>
    return { ...result, signature: 'Unsupported' }
  }

  signAndSubmitDeployContractTx = async (params: SignDeployContractTxParams): Promise<SignDeployContractTxResult> => {
    const result = (
      await this.#executeAlephiumTransaction(params, (p, host, networkId, keyType) => ({
        type: 'DEPLOY_CONTRACT',
        params: { ...p, networkId, signerKeyType: keyType, host },
        salt: Date.now().toString()
      }))
    ).result as Omit<SignDeployContractTxResult, 'signature'>
    return { ...result, signature: 'Unsupported' }
  }

  signAndSubmitExecuteScriptTx = async (params: SignExecuteScriptTxParams): Promise<SignExecuteScriptTxResult> => {
    const result = (
      await this.#executeAlephiumTransaction(params, (p, host, networkId, keyType) => ({
        type: 'EXECUTE_SCRIPT',
        params: { ...p, networkId, signerKeyType: keyType, host },
        salt: Date.now().toString()
      }))
    ).result as Omit<SignExecuteScriptTxResult, 'signature'>
    return { ...result, signature: 'Unsupported' }
  }

  signAndSubmitUnsignedTx = async (params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> => {
    const result = (
      await this.#executeAlephiumTransaction(params, (p, host, networkId, keyType) => ({
        type: 'UNSIGNED_TX',
        params: { ...p, networkId, signerKeyType: keyType, host },
        salt: Date.now().toString()
      }))
    ).result as Omit<SignUnsignedTxResult, 'signature'>
    return { ...result, signature: 'Unsupported' }
  }

  signUnsignedTx = async (_params: SignUnsignedTxParams): Promise<SignUnsignedTxResult> => {
    throw Error('Coming soon')
  }

  signMessage = async (params: SignMessageParams): Promise<SignMessageResult> => {
    return this.#signMessage(params)
  }

  #signMessage = async (params: SignMessageParams): Promise<SignMessageResult> => {
    this.#checkParams(params)

    const resultP = Promise.race([
      waitForMessage(
        "SIGNATURE_SUCCESS",
        11 * 60 * 1000,
      ),
      waitForMessage(
        "SIGNATURE_FAILURE",
        10 * 60 * 1000,
        (x) => x.data.actionHash === actionHash,
      )
        .then(() => "error" as const)
        .catch(() => {
          sendMessage({ type: "SIGNATURE_FAILURE", data: { actionHash } })
          return "timeout" as const
        }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sendMessage({ type: "SIGN_MESSAGE", data: {...params, networkId: this.connectedNetworkId, host: window.location.host } })
    const { actionHash } = await waitForMessage("SIGN_MESSAGE_RES", 1000)

    sendMessage({ type: "OPEN_UI" })

    const result = await resultP

    if (result === "error") {
      throw Error("User abort")
    }
    if (result === "timeout") {
      throw Error("User action timed out")
    }

    return result
  }

  async disconnect(): Promise<void> {
    this.#connectedAccount = undefined
    this.#connectedNetworkId = undefined
    this.#nodeProvider = undefined
    this.#explorerProvider = undefined
    await removePreAuthorization()
    if (this.onDisconnected !== undefined) {
      await this.onDisconnected()
    }
    this.onDisconnected = undefined
  }

  #checkTabFocused() {
    if (!document.hasFocus()) {
      throw Error(`Unsolicited request`)
    }
  }

  #checkParams({ signerAddress }: { signerAddress: Address }): void {
    if (this.#connectedAccount === undefined || this.#connectedNetworkId === undefined) {
      throw Error("No connection")
    }

    if (signerAddress !== this.connectedAccount?.address) {
      throw Error(`Unauthorized address. Expected: ${this.connectedAccount?.address}, got: ${signerAddress}`)
    }

    this.#checkTabFocused()
  }

  async #executeAlephiumTransaction<P extends { signerAddress: Address }>(params: P, dataBuilder: (param: P, host: string, networkId: string, keyType: KeyType) => TransactionParams) {
    this.#checkParams(params)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = dataBuilder(params, window.location.host, this.#connectedNetworkId!, this.connectedAccount!.keyType)

    sendMessage({ type: 'EXECUTE_TRANSACTION', data })
    const { actionHash } = await waitForMessage('EXECUTE_TRANSACTION_RES', 1000)

    sendMessage({ type: "OPEN_UI" })

    const result = await Promise.race([
      waitForMessage(
        "TRANSACTION_SUBMITTED",
        11 * 60 * 1000,
        (x) => x.data.actionHash === actionHash,
      ),
      waitForMessage(
        "TRANSACTION_FAILED",
        10 * 60 * 1000,
        (x) => x.data.actionHash === actionHash,
      )
        .then(() => "error" as const)
        .catch(() => {
          sendMessage({ type: "TRANSACTION_FAILED", data: { actionHash } })
          return "timeout" as const
        }),
    ])

    if (result === "error") {
      throw Error("User abort")
    }
    if (result === "timeout") {
      throw Error("User action timed out")
    }

    return result
  }
})()
