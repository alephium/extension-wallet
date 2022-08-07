export const getExplorerTransactionLink = (hash: string): string => {
  const explorerUrl = "http://localhost:3001"
  return `${explorerUrl}/#/transactions/${hash}`
}

export const openExplorerTransaction = (hash: string) => {
  window.open(getExplorerTransactionLink(hash), "_blank")?.focus()
}
