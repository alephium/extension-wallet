import { decrypt, encrypt } from './crypto'

export class BrowserStorage {
  key: string

  constructor() {
    this.key = 'wallet'
  }

  remove = (name: string) => {
    window.localStorage.removeItem(`${this.key}-${name}`)
  }

  load = (name: string) => {
    const str = window.localStorage.getItem(`${this.key}-${name}`)
    if (str) {
      return JSON.parse(str)
    } else {
      throw new Error(`Unable to load wallet ${name}`)
    }
  }

  save = (name: string, json: unknown) => {
    const str = JSON.stringify(json)
    window.localStorage.setItem(`${this.key}-${name}`, str)
  }

  list = () => {
    const prefixLen = this.key.length + 1
    const xs = []
    for (let i = 0, len = localStorage.length; i < len; ++i) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.key)) {
        xs.push(key.substring(prefixLen))
      }
    }

    return xs
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
