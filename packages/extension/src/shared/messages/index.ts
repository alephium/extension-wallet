import { getMessage } from '@extend-chrome/messages'
import { SendOptions } from '@extend-chrome/messages/types/types'
import { map } from 'rxjs'

import { ActionMessage } from './ActionMessage'
import { AddressMessage } from './AddressMessage'
import { MiscenalleousMessage } from './MiscellaneousMessage'
import { NetworkMessage } from './NetworkMessage'
import { PreAuthorisationMessage } from './PreAuthorisationMessage'
import { RecoveryMessage } from './RecoveryMessage'
import { SessionMessage } from './SessionMessage'
import { TransactionMessage } from './TransactionMessage'

export type MessageType =
  | AddressMessage
  | ActionMessage
  | MiscenalleousMessage
  | NetworkMessage
  | PreAuthorisationMessage
  | SessionMessage
  | TransactionMessage
  | RecoveryMessage

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}

// It is required because chrome won't load `BigInt.prototype.toJSON` from @alephium/web3
(BigInt.prototype as any).toJSON = function() {
  return this.toString()
}

export const [sendMessage, messageStream, _waitForMessage] = function() {
  const [send, stream, receive] = getMessage<string>('ALEPHIUM')
  const sendMessage = async (data: MessageType, options?: SendOptions): Promise<void> => {
    const message = JSON.stringify(data)
    return send(message, options)
  }
  sendMessage.toTab = send.toTab

  const messageStream = map<[string, chrome.runtime.MessageSender], [MessageType, chrome.runtime.MessageSender]>(
    ([message, sender]) => [JSON.parse(message) as MessageType, sender]
  )(stream)

  const waitForMessage = async (predicate?: ((x: MessageType) => boolean) | undefined): Promise<MessageType> => {
    let result: MessageType
    const func = ([message, _sender]: [string, chrome.runtime.MessageSender]) => {
      try {
        result = JSON.parse(message) as MessageType
      } catch (error) {
        console.error(`unknown message: ${message}`)
        throw error
      }
      return predicate === undefined ? true : predicate(result)
    }
    return receive(func as any).then(() => result)
  }

  return [sendMessage, messageStream, waitForMessage]
}()

export async function waitForMessage<K extends MessageType['type'], T extends { type: K } & MessageType>(
  type: K,
  predicate: (x: T) => boolean = () => true
): Promise<T extends { data: infer S } ? S : undefined> {
  return _waitForMessage((msg: any) => msg.type === type && predicate(msg)).then((msg: any) => msg.data)
}
