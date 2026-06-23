import { isDappMessageHasherAllowed, SAFE_DAPP_MESSAGE_HASHERS } from "../messageHasher"

describe("isDappMessageHasherAllowed (dApp signMessage policy)", () => {
  it("accepts only the domain-separated 'alephium' hasher", () => {
    expect(SAFE_DAPP_MESSAGE_HASHERS[0]).toBe("alephium")
    expect(SAFE_DAPP_MESSAGE_HASHERS[1]).toBe("sha256")
    expect(isDappMessageHasherAllowed("alephium")).toBe(true)
    expect(isDappMessageHasherAllowed("sha256")).toBe(true)
  })

  it("rejects every other hasher a dApp could request", () => {
    expect(isDappMessageHasherAllowed("identity")).toBe(false)
    expect(isDappMessageHasherAllowed("blake2b")).toBe(false)
  })
})
