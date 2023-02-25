import { describe, expect, test } from "vitest"

import {
  getNextPathIndex,
} from "../src/background/keys/keyDerivation"

describe("getNextPathIndex", () => {
  test("incrementing", () => {
    expect(
      getNextPathIndex(
        [0, 1, 2],
      ),
    ).toBe(3)
  })

  test("fill incrementing gap", () => {
    expect(
      getNextPathIndex(
        [0, 1, 3],
      ),
    ).toBe(2)
  })

  test("fill big gap", () => {
    expect(
      getNextPathIndex(
        [0, 4, 11],
      ),
    ).toBe(1)
  })

  test("fill 0 gap", () => {
    expect(
      getNextPathIndex(
        [3, 1],
      ),
    ).toBe(0)
  })

  test("legacy gets ignored", () => {
    expect(
      getNextPathIndex(
        [1, 2],
      ),
    ).toBe(0)
  })

  test("can still add legacy paths to mixed array", () => {
    expect(
      getNextPathIndex(
        [0, 1, 3, 4]
      ),
    ).toBe(2)
  })

  test("empty array", () => {
    expect(getNextPathIndex([])).toBe(0)
  })
})
