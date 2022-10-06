export const getExplorerTransactionLink = (explorerUrl: string, hash: string): string =>
  `${explorerUrl}/#/transactions/${hash}`

export const openExplorerTransaction = (explorerUrl: string, hash: string) => {
  window.open(getExplorerTransactionLink(explorerUrl, hash), '_blank')?.focus()
}
