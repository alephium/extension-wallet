import { Fetcher } from "swr"
import { KeyValueStorage } from '../storage'

export const fetchImmutableStorage = new KeyValueStorage<Record<string, any>>(
  {},
  "shared:fetchImmutable",
)

// This function should only be used for requests that have immutable responses.
export async function fetchImmutable<Data>(key: string, fetcher: Fetcher<Data, string>): Promise<Data> {
  const cachedResponse = await fetchImmutableStorage.get(key)
  if (cachedResponse) {
    console.debug("fetchImmutable cache hit", cachedResponse)
    return cachedResponse
  } else {
    const response = await fetcher(key)
    console.debug("fetchImmutable cache missed, fetching", key)
    fetchImmutableStorage.set(key, response)
    return response
  }
}

export async function getImmutable<Data>(key: string): Promise<Data | undefined> {
  return await fetchImmutableStorage.get(key)
}

export async function storeImmutable<Data>(key: string, data: Data): Promise<void> {
  return await fetchImmutableStorage.set(key, data)
}

export async function clearCache(key: string): Promise<void> {
  await fetchImmutableStorage.delete(key)
}
