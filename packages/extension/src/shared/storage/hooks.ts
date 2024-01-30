import { memoize, isEqual } from "lodash-es"
import { useCallback, useEffect, useMemo, useState } from "react"

import { swrCacheProvider } from "../../ui/services/swr"
import { IArrayStorage } from "./array"
import { IKeyValueStorage } from "./keyvalue"
import { IObjectStorage } from "./object"
import { SelectorFn } from "./types"

export function useKeyValueStorage<
  T extends Record<string, any> = Record<string, any>,
  K extends keyof T = keyof T,
>(storage: IKeyValueStorage<T>, key: K): T[K] {
  const [value, setValue] = useState<T[K]>(
    swrCacheProvider.get(storage.namespace + ":" + key.toString()) ??
      storage.defaults[key],
  )

  const set = useCallback(
    (v: T[K]) => {
      const k = storage.namespace + ":" + key.toString()

      if (!isEqual(swrCacheProvider.get(k), v)) {
        swrCacheProvider.set(storage.namespace + ":" + key.toString(), v)
        setValue(v)
      }
    },
    [key, storage.namespace],
  )

  useEffect(() => {
    storage.get(key).then(set)
    const sub = storage.subscribe(key, set)
    return () => sub()
  }, [storage, key, set])

  return value
}

export function useObjectStorage<T>(storage: IObjectStorage<T>): T {
  const [value, setValue] = useState<T>(
    swrCacheProvider.get(storage.namespace) ?? storage.defaults,
  )

  const set = useCallback(
    (value: T) => {
      if (!isEqual(swrCacheProvider.get(storage.namespace), value)) {
        swrCacheProvider.set(storage.namespace, value)
        setValue(value)
      }
    },
    [storage.namespace],
  )

  useEffect(() => {
    storage.get().then(set)
    const sub = storage.subscribe(set)
    return () => sub()
  }, [set, storage])

  return value
}

const defaultSelector = memoize(
  () => true,
  () => "default",
)

export function useArrayStorage<T>(
  storage: IArrayStorage<T>,
  selector: SelectorFn<T> = defaultSelector,
): T[] {
  const [value, setValue] = useState<T[]>(
    swrCacheProvider.get(storage.namespace) ?? storage.defaults,
  )

  const set = useCallback(
    (v: T[]) => {
      if (!isEqual(swrCacheProvider.get(storage.namespace), v)) {
        swrCacheProvider.set(storage.namespace, v)
        setValue(v)
      }
    },
    [storage.namespace],
  )

  useEffect(() => {
    storage.get().then(set)
    const sub = storage.subscribe(set)
    return () => sub()
  }, [selector, storage, set])

  return useMemo(() => value.filter(selector), [value, selector])
}
