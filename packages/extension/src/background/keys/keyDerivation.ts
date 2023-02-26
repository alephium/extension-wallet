export function getNextPathIndex(indexes: number[]): number {
  if (indexes.length === 0) {
    return 0
  } else {
    return Math.max(...indexes) + 1
  }
}

