export function arrayBufferToString(array: ArrayBuffer): string {
  return new Uint8Array(array).reduce(
    (data, byte) => data + String.fromCharCode(byte),
    "",
  )
}
