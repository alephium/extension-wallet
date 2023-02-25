import { Account, addressFromPublicKey } from "@alephium/web3";
import { Event, getEventHash, serializeEvent, UnsignedEvent } from "nostr-tools";
import { alephiumWindowObject } from "./alephiumWindowObject";
import { NostrObject } from "./inpage.model";

export const nostrObject: NostrObject = new (class implements NostrObject {
  private connectedAccount: Account | undefined = undefined

  async getPublicKey(): Promise<string> {
    if (this.connectedAccount !== undefined) {
      return this.connectedAccount.publicKey
    }

    const account = await alephiumWindowObject.enable({ keyType: 'bip340-schnorr', onDisconnected: () => { return } })
    this.connectedAccount = account
    return account.publicKey
  }

  async signEvent(t: UnsignedEvent): Promise<Event> {
    const event = t as Event
    event.id = getEventHash(event)
    const result = await alephiumWindowObject.signMessage({
      signerAddress: addressFromPublicKey(event.pubkey, 'bip340-schnorr'),
      signerKeyType: 'bip340-schnorr',
      message: serializeEvent(event),
      messageHasher: 'sha256'
    })
    event.sig = result.signature
    return event
  }
})()
