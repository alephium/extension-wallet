import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"

vi.doMock("./messageActions", () => ({
  sendMessage: vi.fn(),
  waitForMessage: vi.fn(),
}))
vi.doMock("./messaging", () => ({
  getIsPreauthorized: vi.fn(),
  removePreAuthorization: vi.fn(),
}))

const { sendMessage, waitForMessage } = await import("./messageActions")

async function provider() {
  return (await import("./alephiumWindowObject")).alephiumWindowObject
}

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.spyOn(document, "hasFocus").mockReturnValue(false)
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible")
  vi.mocked(waitForMessage).mockImplementation((type) =>
    type === "ALPH_CONNECT_DAPP_RES"
      ? Promise.resolve(null)
      : new Promise(() => {}),
  )
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe("connection focus and visibility", () => {
  it("reconnects after refresh/hot reload while devtools has focus and still rejects signing", async () => {
    const { addressFromPublicKey } = await import("@alephium/web3")
    const { getIsPreauthorized } = await import("./messaging")
    const publicKey = "02" + "11".repeat(32)
    const address = addressFromPublicKey(publicKey)
    vi.mocked(getIsPreauthorized).mockResolvedValue(true)
    vi.mocked(waitForMessage).mockImplementation((type) =>
      type === "ALPH_CONNECT_DAPP_RES"
        ? Promise.resolve({
            address,
            signer: { publicKey, keyType: "default" },
            network: { id: "devnet", nodeUrl: "https://node.example.org" },
          } as any)
        : new Promise(() => {}),
    )
    for (let load = 0; load < 2; load++) {
      vi.resetModules()
      const wallet = await provider()
      expect(wallet.connectedAccount).toBeUndefined()
      const connected = await wallet.enableIfConnected({
        onDisconnected: () => {},
      })
      expect(connected?.address).toBe(address)
      expect(sendMessage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: "ALPH_CONNECT_DAPP",
          data: expect.objectContaining({ silent: true }),
        }),
      )
      const sent = vi.mocked(sendMessage).mock.calls.length
      await expect(
        wallet.signMessage({
          signerAddress: address,
          message: "test",
          messageHasher: "sha256",
        }),
      ).rejects.toThrow("Unsolicited request")
      expect(sendMessage).toHaveBeenCalledTimes(sent)
    }
  })

  it("rejects a hidden page before sending any request", async () => {
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden")
    const wallet = await provider()
    await expect(wallet.enable()).rejects.toThrow("Unsolicited request")
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it("retains the interactive path for a focused page", async () => {
    vi.mocked(document.hasFocus).mockReturnValue(true)
    const wallet = await provider()
    await expect(wallet.enable()).rejects.toThrow(
      "No authorized wallet account",
    )
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ALPH_CONNECT_DAPP",
        data: expect.objectContaining({ silent: false }),
      }),
    )
  })
})
