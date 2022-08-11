import { useEffect, useState } from "react"

import { getSeedPhrase } from "../../services/backgroundAddresses"

export const useSeedPhrase = () => {
  const [seedPhrase, setSeedPhrase] = useState<string>()
  useEffect(() => {
    ; (async () => {
      const seedPhrase = await getSeedPhrase()
      setSeedPhrase(seedPhrase)
    })()
  }, [])

  return seedPhrase
}
