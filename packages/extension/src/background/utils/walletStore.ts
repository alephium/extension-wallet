import { decrypt, encrypt } from './crypto'
import browser from "webextension-polyfill"

export class BrowserStorage {
  key: string

  constructor() {
    this.key = 'wallet'
  }

  remove = (name: string): Promise<void> => {
    return browser.storage.local.remove(`${this.key}-${name}`)
  }

  load = async (name: string): Promise<string> => {
    const key = `${this.key}-${name}`
    const result = await browser.storage.local.get(key)
    if (result && result[key]) {
      return JSON.parse(result[key])
    } else {
      throw new Error(`Unable to load wallet ${name}`)
    }
  }

  save = (name: string, json: unknown): Promise<void> => {
    const value: { [key: string]: unknown } = {}
    const keyName = `${this.key}-${name}`
    value[keyName] = JSON.stringify(json)
    return browser.storage.local.set(value)
  }
}

class StoredState {
  readonly version = 1
  readonly mnemonic: string

  constructor({ mnemonic }: { mnemonic: string }) {
    this.mnemonic = mnemonic
  }
}

export const walletOpen = (password: string, encryptedWallet: string) => {
  const dataDecrypted = decrypt(password, encryptedWallet)
  const config = JSON.parse(dataDecrypted) as StoredState

  return config.mnemonic
}

export const walletEncrypt = (password: string, mnemonic: string) => {
  const storedState = new StoredState({
    mnemonic
  })

  return encrypt(password, JSON.stringify(storedState))
}
