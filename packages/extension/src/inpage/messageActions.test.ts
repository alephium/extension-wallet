import { afterEach, expect, it, vi } from "vitest"
import { sendMessage } from "./messageActions"

afterEach(() => vi.restoreAllMocks())

it("serializes nested transaction amounts locally without installing a BigInt JSON hook", () => {
  const descriptor = Object.getOwnPropertyDescriptor(BigInt.prototype, "toJSON")
  const postMessage = vi
    .spyOn(window, "postMessage")
    .mockImplementation(() => {})
  sendMessage({
    type: "ALPH_TEST",
    data: { amount: 9007199254740993n, nested: [1n, { amount: 2n }] },
  } as any)
  expect(postMessage).toHaveBeenCalledWith(
    {
      type: "ALPH_TEST",
      data: { amount: "9007199254740993", nested: ["1", { amount: "2" }] },
      extensionId: undefined,
    },
    window.location.origin,
  )
  expect(Object.getOwnPropertyDescriptor(BigInt.prototype, "toJSON")).toEqual(
    descriptor,
  )
})

it("keeps decimal wallet amounts when the page defines its own JSON hook", () => {
  const previous = Object.getOwnPropertyDescriptor(BigInt.prototype, "toJSON")
  const hook = () => "site-owned"
  Object.defineProperty(BigInt.prototype, "toJSON", {
    configurable: true,
    value: hook,
  })
  try {
    const postMessage = vi
      .spyOn(window, "postMessage")
      .mockImplementation(() => {})
    sendMessage({ type: "ALPH_TEST", data: { amount: 7n } } as any)
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: { amount: "7" } }),
      window.location.origin,
    )
    expect(JSON.stringify(7n)).toBe('"site-owned"')
  } finally {
    if (previous) Object.defineProperty(BigInt.prototype, "toJSON", previous)
    else Reflect.deleteProperty(BigInt.prototype, "toJSON")
  }
})
