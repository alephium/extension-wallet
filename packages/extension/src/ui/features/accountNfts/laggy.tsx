import { SWRHook } from "swr"
import { useRef, useEffect, useCallback } from 'react'

// from: https://swr.vercel.app/docs/middleware#keep-previous-result
export function laggy(useSWRNext: SWRHook) {
  return (key: any, fetcher: any, config: any) => {
    const laggyDataRef = useRef()
    const swr = useSWRNext(key, fetcher, config)

    useEffect(() => {
      if (swr.data !== undefined) {
        laggyDataRef.current = swr.data
      }
    }, [swr.data])

    const resetLaggy = useCallback(() => {
      laggyDataRef.current = undefined
    }, [])

    const dataOrLaggyData = swr.data === undefined ? laggyDataRef.current : swr.data
    const isLagging = swr.data === undefined && laggyDataRef.current !== undefined

    return Object.assign({}, swr, {
      data: dataOrLaggyData,
      isLagging,
      resetLaggy,
    })
  }
}