import { Fetcher } from "swr"
import { KeyValueStorage } from '../storage'

export const pureFetchStorage = new KeyValueStorage<Record<string, any>>(
  {},
  "shared:pureFetch",
)

// This function should only be used for requests that have immutable responses.
export async function pureFetch<Data>(key: string, fetcher: Fetcher<Data, string>): Promise<Data> {
  const cachedResponse = await pureFetchStorage.get(key)
  if (cachedResponse) {
    console.debug("pureFetch cache hit", cachedResponse)
    return cachedResponse
  } else {
    const response = await fetcher(key)
    console.debug("pureFetch cache missed, fetching", key)
    pureFetchStorage.set(key, response)
    return response
  }
}

export async function clearCache(key: string): Promise<void> {
  await pureFetchStorage.delete(key)
}
