import { MessageHasher } from "@alephium/web3"

export const SAFE_DAPP_MESSAGE_HASHERS: MessageHasher[] = ["alephium", "sha256"]

export const isDappMessageHasherAllowed = (messageHasher: MessageHasher): boolean =>
  SAFE_DAPP_MESSAGE_HASHERS.includes(messageHasher)
