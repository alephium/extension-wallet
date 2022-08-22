export const getExplorerTransactionLink = (hash: string): string => {
  const explorerUrl = "https://alephium.softfork.se/"
  return `${explorerUrl}/#/transactions/${hash}`
}

export const openExplorerTransaction = (hash: string) => {
  window.open(getExplorerTransactionLink(hash), "_blank")?.focus()
}
