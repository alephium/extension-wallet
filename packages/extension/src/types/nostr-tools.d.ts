declare module 'nostr-tools' {
  export interface UnsignedEvent {
    kind: number;
    pubkey: string;
    created_at: number;
    content: string;
    tags: string[][];
  }

  export interface Event extends UnsignedEvent {
    id: string;
    sig: string;
  }

  export function getEventHash(event: UnsignedEvent): string;
  export function serializeEvent(event: Event): string;

  export namespace nip19 {
    export function npubEncode(hex: string): string;
  }
} 