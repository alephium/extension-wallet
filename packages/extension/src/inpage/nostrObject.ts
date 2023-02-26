import { Account, addressFromPublicKey } from "@alephium/web3";
import { Event, getEventHash, serializeEvent, UnsignedEvent } from "nostr-tools";
import { alephiumWindowObject } from "./alephiumWindowObject";
import { NostrObject } from "./inpage.model";

export const nostrObject: NostrObject = new (class implements NostrObject {
  connectedAccount: Account | undefined = undefined

  async connectIfNotYet(): Promise<void> {
    if (this.connectedAccount === undefined) {
      const account = await alephiumWindowObject.enable({ keyType: 'bip340-schnorr', onDisconnected: () => { return } })
      this.connectedAccount = account
    }
  }

  async getPublicKey(): Promise<string> {
    await this.connectIfNotYet()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.connectedAccount!.publicKey
  }

  async signEvent(t: UnsignedEvent): Promise<Event> {
    await this.connectIfNotYet()

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
