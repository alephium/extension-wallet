import "svelte"

import discoveryWallets from "../discovery"
import type {
  GetAlephiumWalletOptions,
  IAlephiumWindowObject,
  WalletProvider,
} from "../types"
import { filterBy, sortBy } from "../utils"
import Modal from "./Modal.svelte"

export default async function show(
  installed: IAlephiumWindowObject[],
  options?: GetAlephiumWalletOptions,
): Promise<IAlephiumWindowObject | undefined> {
  const installedWalletIds = new Set(installed.map((w) => w.id))
  // remove installed wallets from discovery
  let discovery = discoveryWallets.filter(
    (dw) => !installedWalletIds.has(dw.id),
  )
  discovery = filterBy<WalletProvider>(discovery, options)
  discovery = sortBy<WalletProvider>(discovery, options?.order)

  return new Promise((resolve) => {
    const modal = new Modal({
      target: document.body,
      props: {
        callback: (value: any) => {
          modal.$destroy()
          resolve(value)
        },
        installed,
        discovery,
        options: options?.modalOptions,
      },
    })
  })
}
