import { beforeEach, describe, expect, it, vi } from "vitest"

vi.doMock("../shared/preAuthorizations", () => ({
  preAuthorizeStore: { subscribe: vi.fn() },
  getPreAuthorized: vi.fn(),
  setConnectionExpiryAlarm: vi.fn(),
}))
vi.doMock("../shared/wallet.service", () => ({
  withNetwork: async (value: unknown) => value,
}))
vi.doMock("./activeTabs", () => ({
  addTab: vi.fn(),
  sendMessageToHost: vi.fn(),
}))
vi.doMock("./openUi", () => ({ openUi: vi.fn() }))
vi.doMock("./background", () => ({ UnhandledMessage: class extends Error {} }))

const { handlePreAuthorizationMessage } = await import(
  "./preAuthorizationMessaging"
)
const { getPreAuthorized } = await import("../shared/preAuthorizations")
const { openUi } = await import("./openUi")
const { addTab } = await import("./activeTabs")

const account = { address: "authorized-account" }

function request(silent: boolean, selectedAccount: unknown = account) {
  const respond = vi.fn()
  const push = vi.fn()
  const wallet = {
    getSelectedAccount: vi.fn().mockResolvedValue(selectedAccount),
    getAccount: vi.fn().mockResolvedValue(account),
  }
  const done = handlePreAuthorizationMessage({
    msg: { type: "ALPH_CONNECT_DAPP", data: { host: "example.org", silent } },
    sender: { tab: { id: 1 } },
    background: { wallet, actionQueue: { push } },
    respond,
  } as any)
  return { done, respond, push }
}

describe("silent reconnect", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("resumes an existing authorization without prompting", async () => {
    vi.mocked(getPreAuthorized).mockResolvedValue({ account } as any)
    const result = request(true)
    await result.done
    expect(result.respond).toHaveBeenCalledWith({
      type: "ALPH_CONNECT_DAPP_RES",
      data: account,
    })
    expect(result.push).not.toHaveBeenCalled()
    expect(openUi).not.toHaveBeenCalled()
  })

  it("does not prompt if authorization expired or was revoked after the page preflight", async () => {
    vi.mocked(getPreAuthorized).mockResolvedValue(undefined)
    const result = request(true)
    await result.done
    expect(result.respond).toHaveBeenCalledWith({
      type: "ALPH_CONNECT_DAPP_RES",
      data: null,
    })
    expect(result.push).not.toHaveBeenCalled()
    expect(openUi).not.toHaveBeenCalled()
    expect(addTab).not.toHaveBeenCalled()
  })

  it("does not open an uninitialized wallet for a silent request", async () => {
    const result = request(true, null)
    await result.done
    expect(result.respond).toHaveBeenCalledWith({
      type: "ALPH_CONNECT_DAPP_RES",
      data: null,
    })
    expect(openUi).not.toHaveBeenCalled()
    expect(result.push).not.toHaveBeenCalled()
  })

  it("preserves the approval flow for an interactive request", async () => {
    vi.mocked(getPreAuthorized).mockResolvedValue(undefined)
    const result = request(false)
    await result.done
    expect(result.push).toHaveBeenCalledOnce()
    expect(openUi).toHaveBeenCalledOnce()
  })
})
