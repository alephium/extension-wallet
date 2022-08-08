import { getMessage } from "@extend-chrome/messages"

import { AccountMessage } from "./AccountMessage"
import { ActionMessage } from "./ActionMessage"
import { MiscenalleousMessage } from "./MiscellaneousMessage"
import { NetworkMessage } from "./NetworkMessage"
import { PreAuthorisationMessage } from "./PreAuthorisationMessage"
import { RecoveryMessage } from "./RecoveryMessage"
import { SessionMessage } from "./SessionMessage"
import { TransactionMessage } from "./TransactionMessage"

export type MessageType =
  | AccountMessage
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

export const [sendMessage, messageStream, _waitForMessage] =
  getMessage<MessageType>("ALEPHIUM")

export async function waitForMessage<
  K extends MessageType["type"],
  T extends { type: K } & MessageType,
>(
  type: K,
  predicate: (x: T) => boolean = () => true,
): Promise<T extends { data: infer S } ? S : undefined> {
  return _waitForMessage(
    ([msg]: any) => msg.type === type && predicate(msg),
  ).then(([msg]: any) => msg.data)
}
